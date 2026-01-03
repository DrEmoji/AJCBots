const fs = require('fs').promises;
const setTitle = require('console-title');
const { WebSocketServer } = require('ws');
const clc = require('cli-color');
const Client = require('./Client'); 
const { getRndInteger, heart, star, tree } = require('./utils/Extra.js');
let activeClients = [];

async function loadAccounts(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return data
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [username, password] = line.split(':');
      return { username, password };
    });
}

async function InitClient({ username, password }) {
  const client = new Client({ username, password });

  await client.init();

  client.controller.on('close', () => {
    console.log(`Connection closed: ${username}`);
    const index = activeClients.indexOf(client);
    if (index !== -1) {
      activeClients.splice(index, 1);
      console.log(`Removed client: ${username}`);
    }
  });


  return client;
}

(async () => {
  const accounts = await loadAccounts('accounts.txt');

  setTitle("Animal Jam Bot's | Created By Doc/DrEmoji |");
  console.log(clc.green(`Animal Jam Classic Bot's created by Doc/DrEmoji\n`));
  console.log(clc.red(`By using this program you agree that the user known as DrEmoji will not offer any support or help you in anyway shape or form\n`));
  console.log(clc.red(`You also agree that DrEmoji has no liability for what you do with this software and you accept all consequences if anything was to happen`));

  const BATCH_SIZE = 5;

  for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
    const batch = accounts.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (credentials) => {
        try {
          const client = await InitClient(credentials);
          client.controller.on('ready', async () => {
            console.log(`Initialized: ${credentials.username}`);
            activeClients.push(client);
          });
        } catch (err) {
          console.error(`Failed to init: ${credentials.username}`, err);
        }
      })
    );

    console.log(`Batch ${i / BATCH_SIZE + 1} complete (${results.length} accounts)`);
  }


  const commandsThatUseIntervals = [
    "randompos",
    "wave",
    "heart",
    "tree",
    "star",
    "lineup",
    "circle"
  ];

  async function RunCommand(args) {
    try {
      const command = args[0];
      
      if (commandsThatUseIntervals.includes(command) && globalThis.Interval) {
        clearInterval(globalThis.Interval);
      }

      switch (command) {
        case "joinden":
          for (const client of activeClients) {
            try { client.JoinDen(args[1], args[2]); } catch {}
          }
          break;

        case "joinworld":
          for (const client of activeClients) {
            try { client.JoinWorld(args[1], args[2]); } catch {}
          }
          break;

        case "joinuser":
          for (const client of activeClients) {
            try { client.JoinUser(args[1]); } catch {}
          }
          break;

        case "chat": {
          const message = args.slice(1).join(" ");
          for (const client of activeClients) client.Chat(message);
          break;
        }

        case "emote":
          for (const client of activeClients) client.Emote(args[1]);
          break;

        case "move":
          for (const client of activeClients) {
            client.MoveTo(args[1], args[2]);
            client.Log(`Moved to x:${args[1]}, y:${args[2]}`);
          }
          break;

        case "offsetmove":
          for (const client of activeClients)
            client.MoveTo(Number(args[1]) + getRndInteger(50,150), Number(args[2]) + getRndInteger(50,150));
          break;

        case "randompos":
          globalThis.Interval = setInterval(() => {
            for (const client of activeClients) {
              client.SetPose(5,1);
              client.MoveTo(Number(args[1]) + getRndInteger(-args[3],args[3]), Number(args[2]) + getRndInteger(-args[3],args[3]));
            }
          }, 1000);
          break;

        case "rainbow":
          for (const client of activeClients) client.Rainbow();
          break;

        case "heart":
          for (let i = 0; i < activeClients.length; i++) {
            if (!heart[i]) break;
            const x = Number(args[1]) + heart[i][0];
            const y = Number(args[2]) + heart[i][1];
            activeClients[i].SetColor(4294901760);
            activeClients[i].Log(`x=${x}, y=${y}`);
            activeClients[i].MoveTo(x, y);
          }
          break;

        case "tree":
          for (let i = 0; i < activeClients.length; i++) {
            if (!tree[i]) break;
            const x = Number(args[1]) + tree[i][0];
            const y = Number(args[2]) + tree[i][1];
            activeClients[i].SetColor(tree[i][2]);
            activeClients[i].Log(`x=${x}, y=${y}`);
            activeClients[i].MoveTo(x, y);
          }
          break;


        case "star":
          for (let i = 0; i < activeClients.length; i++) {
            if (!star[i]) break;
            const x = Number(args[1]) + star[i][0];
            const y = Number(args[2]) + star[i][1];
            activeClients[i].SetColor(4294967040);
            activeClients[i].Log(`x=${x}, y=${y}`);
            activeClients[i].MoveTo(x, y);
          }
          break;

        case "lineup":
          for (let i = 0; i < activeClients.length; i++) {
            const baseX = Number(args[1]);
            const y = args[2];
            const offsetX = Math.pow(-1, i) * Math.ceil(i / 2) * 50;
            const x = baseX + offsetX;
            activeClients[i].Log(`x=${x}, y=${y}`);
            activeClients[i].MoveTo(x, y);
          }
          break;

        case "wave": {
          const baseX = Number(args[1]);
          const baseY = Number(args[2]);
          const amplitude = Number(args[3]) || 50;
          const frequency = Number(args[4]) || 0.5;
          let phase = 0;
          const count = activeClients.length;

          globalThis.Interval = setInterval(() => {
            for (let i = 0; i < count; i++) {
              const offsetX = Math.pow(-1, i) * Math.ceil(i / 2) * 50;
              const x = Math.round(baseX + offsetX);
              const y = Math.round(baseY + amplitude * Math.sin(frequency * i + phase));
              if (activeClients[i]) activeClients[i].MoveTo(x, y);
            }
            phase += 0.1;
          }, 20);
          break;
        }
        
        case "circle": {
          const centerX = Number(args[1]);
          const centerY = Number(args[2]);
          const centerZ = Number(args[3]);
          const radius  = Number(args[4]) || 100;

          let angleOffset = 0;
          const count = activeClients.length;

          globalThis.Interval = setInterval(() => {
            for (let i = 0; i < count; i++) {
              const angle = (2 * Math.PI / count) * i + angleOffset;

              const x = centerX + radius * Math.cos(angle);
              const z = centerZ + radius * Math.sin(angle);
              const y = centerY;

              if (activeClients[i]) {
                activeClients[i].MoveTo(x, y, z);
              }
            }

            angleOffset += 0.05;
          }, 20);

          break;
        }

        case "emoji":
          for (const client of activeClients) client.SendEmoji(args[1]);
          break;

        case "color":
          for (const client of activeClients) client.SetColor(args[1]);
          break;

        case "alpha":
          for (const client of activeClients) client.SetTransparency(args[1]);
          break;

        case "setpose":
          for (const client of activeClients) client.SetPose(args[1], args[2]);
          break;

        default:
          console.log(`Unknown command: ${command}`);
      }
    } catch (err) {
      console.error(err);
    }
  }


  console.log(`\nSuccessfully initialized ${activeClients.length} clients.`);
  setTitle(`Animal Jam Bot's | Clients: ${activeClients.length} | Created By Doc/DrEmoji |`);

  const wss = new WebSocketServer({ port: 3000 });

  wss.on('connection', function connection(ws) {
    console.log('WebSocket connected');

    ws.on('message', async function incoming(message) {
      const command = message.toString().trim();
      console.log(`Received command: ${command}`);
      try {
        await RunCommand(command.split(" "));
        ws.send(`Executed: ${command}`);
      } catch (err) {
        console.error(`Error running command: ${err}`);
        ws.send(`Error: ${err.message}`);
      }
    });
  });

  console.log(`WebSocket server started on ws://localhost:3000`);
})();
