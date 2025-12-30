const { NetworkController } = require('./Controller.js');
const { wait, getRndInteger, Login, CheckSessions, loadSessions, saveSessions, SpawnLoc } = require("./utils/Extra.js");

class Client {
  username;
  password;
  connection;
  roomid;
  rainbow;
  pose;
  posing;

  constructor({ username, password }) {
    this.username = username;
    this.password = password;
    this.controller = null;
    this.pose = "14";
    this.posing = "0"
    this.rainbow = false;
  }

  get connection() {
    return this.controller;
  }

  async init() {
    const sessions = await loadSessions();
    let auth_token = sessions[this.username] || "";
    const isValid = await CheckSessions(auth_token);
    if (!isValid) {
      auth_token = await Login(this.username, this.password);

      if (auth_token) {
        sessions[this.username] = auth_token;
        await saveSessions(sessions);
        console.log("Login successful!");
      } else {
        console.log("User has failed to Auth");
        throw new Error("Auth Failed");
      }
    } else {
      console.log("Using stored session token.");
    }

     if (!auth_token || typeof auth_token !== 'string' || auth_token.trim() === '') {
      throw new Error("No valid auth token available. Aborting controller init.!");
    }

    this.controller = new NetworkController({
      username: this.username,
      auth_token,
      domain: "flash",
      // proxy: {
      //   host: 'REDACTED',
      //   port: 123456,
      //   username: "REDACTED",
      //   password: "REDACTED"
      // }
    });

    await this.controller.connect();
    this.Log('Connected to server!');
    //this.AntiAFK();
    this.startLoop();
  }

  Log(message) {
    this.controller.Log(message);
  }

  async Wait() {
    await wait(500);
  }

  startLoop() {
    (async () => {
      while (true) {
        if (this.rainbow) {
          const rgb = getRndInteger(0x000000, 0xFFFFFF);
          const color = 0xFF000000 | rgb; 
          const decimalColor = color >>> 0; 
          await this.controller.sendXMLMessage([decimalColor,8])
        }
        await wait(1000);
      }
    })();
  }

  // doesn't work anymore, you'll have to figure out a new anti afk system (I don't wanna keep updating it)
  // AntiAFK() {
  //    (async () => {
  //     await wait(1000);
  //     while (true) {
  //         await this.controller.sendXTMessage(["ka", this.controller.roomid]);
  //         await this.controller.sendXTMessage(["rc", this.controller.roomid]);
  //       await wait(240000);
  //     }
  //   })();
  // }

  async JoinDen(username,Instantiate = true) {
    await this.controller.sendXTMessage(["dj", this.controller.roomid, `den${username}`, "1", "-1"]);
    await this.Wait();
    if (Instantiate) {
      await this.MoveTo(197, 415);
    }
    this.Log("Joined Room!!!")
  }

  async JoinWorld(world,Instantiate = true) { 
    await this.controller.sendXTMessage(["rj", this.controller.roomid, world, "1","0","0"]);
    await this.Wait();
    if (Instantiate) {
      const worldspawn = SpawnLoc[world.split("#")[0]];
      if (worldspawn) {
        this.Log(worldspawn);
        await this.MoveTo(worldspawn.x, worldspawn.y);
      } else {
        await this.MoveTo(197, 415);
      }
    }
    this.Log("Joined World!!!");
  }

  async JoinUser(username,Instantiate = true) { 
    await this.controller.sendXTMessage(["br", this.controller.roomid, username]);
    const parts = await this.controller.waitForXT("br");
    const targetroom = parts[4];
    if (targetroom.startsWith('den')) {
      this.JoinDen(targetroom.substring(3), Instantiate);
    }
    else {
      this.JoinWorld(targetroom,Instantiate);
    }
  }

  async MoveTo(x, y) {
    await this.controller.sendXTMessage(["au", this.controller.roomid, "1", x.toString(), y.toString(), this.pose, this.posing]);
  }

  async Chat(message) {
    let parameter = 9;
    if (this.controller.userData.sgChatType == "1") {
      parameter = 0;
    }
    await this.controller.sendXMLMessage([message,parameter])
    this.Log(`Chatted: ${message}`);
  }

  async SendEmoji(id = 14) {
    await this.controller.sendXMLMessage([id,2]);
    this.Log(`Sent Emoji: ${id}`);
  }

  
  async Emote(emote) {
    await this.controller.sendXMLMessage([emote, 3, 4]);
    this.Log(`Emote: ${emote}`);
  }

  async SetColor(color) {
    await this.controller.sendXMLMessage([color,8])
  }

  async SetTransparency(alpha = 100) {
    await this.controller.sendXMLMessage([alpha,10])
  }

  SetPose(pose,posing) {
    this.pose = pose
    this.posing = posing;
  }

  Rainbow() {
    this.rainbow = !this.rainbow
    this.Log("Rainbow: " + this.rainbow)
  }
}

module.exports = Client
