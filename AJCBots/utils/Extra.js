const { ANIMAL_JAM_AUTHENTICATOR } = require('./Constants.js')
const { v4: uuidv4 } = require('uuid');
const { readFile, writeFile } = require('fs/promises');
const path = require('path');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const heart = [[0,0],[50,-50],[-50,-50],[100,-100],[-100,-100],[150,-150],[-150,-150],[-200,-200],[200,-200],[-200,-250],[200,-250],[-100,-300],[100,-300],[-50,-250],[50,-250]]

const star = [[0, -100],[23, -31],[95, -31],[38, 12],[59, 81],[0, 38],[-59, 81],[-38, 12],[-95, -31],[-23, -31]];

const tree = [[0,0,4282974241],[0,-50,4282974241],[0,-100,4280453922],[50,-100,4280453922],[100,-100,4294901760],[-50,-100,4280453922],[-100,-100,4294901760],[-150,-100,4280453922],[150,-100,4280453922],[0,-150,4280453922],[50,-150,4280453922],[100,-150,4280453922],[-50,-150,4280453922],[-100,-150,4280453922],[0,-200,4280453922],[0,-250,4280453922],[50,-250,4294901760],[-50,-250,4294901760],[100,-250,4280453922],[-100,-250,4280453922],[0,-300,4280453922],[-50,-300,4280453922],[50,-300,4280453922],[0,-350,4294967040]]

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function Login(username,password) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`${ANIMAL_JAM_AUTHENTICATOR}/authenticate`, {
                method: 'POST',
                includeHost: false,
                headers: {
                    'host': 'authenticator.animaljam.com',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) AJClassic/1.5.7 Chrome/87.0.4280.141 Electron/11.5.0 Safari/537.36',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    domain: 'flash',
                    df: uuidv4()
                }),
                // proxy: {
                //     host: 'REDACTED',
                //     port: 123456,
                //     username: "REDACTED",
                //     password: "REDACTED"
                // }
            });
            const parsedbody = await response.json();
            resolve(parsedbody['auth_token']);
        } catch (error) {
            reject(error);
        }
    });
}
const parentDir = path.resolve(__dirname, '..');
const SESSIONS_PATH = path.resolve(parentDir, 'sessions.json');

async function loadSessions() {
  try {
    const data = await readFile(SESSIONS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

async function saveSessions(sessions) {
  await writeFile(SESSIONS_PATH, JSON.stringify(sessions, null, 2));
}

async function CheckSessions(auth) {
    try {
        const response = await fetch("https://player-session-data.animaljam.com/player?domain=flash&client_version=1714", {
            headers: {
                "Authorization": `Bearer ${auth}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) AJClassic/1.5.7 Chrome/87.0.4280.141 Electron/11.5.0 Safari/537.36"
            },
            // proxy: {
            //     host: 'REDACTED',
            //     port: 123456,
            //     username: "REDACTED",
            //     password: "REDACTED"
            // }
        });

        return response.status === 200;

    } catch (error) {
        console.error("Fetch error:", error);
        return false;
    }
}

const SpawnLoc = {
  "jamaa_township.room_main": { x: 690, y: 650 },
  "crystal_sands.room_main": { x: 1098, y: 896 },
  "coral_canyons.room_main": { x: 85, y: 1100 },
  "sarepia_forest.room_main": { x: -60, y: -720 },
  "lost_temple_of_zios.room_main": { x: 1712, y: 854 },
  "appondale.room_main": { x: 480, y: 640 },
  "balloosh.room_main": { x: 1530, y: 1330 },
  "mt_shiveer.room_main": { x: 1430, y: 2050 },
  "kani_cove.room_main": { x: 2100, y: 2300 },
  "crystal_reef.room_main": { x: 1950, y: 1950 },
  "deep_blue.room_main": { x: 2400, y: 2450 }
};


module.exports = {
    wait,
    getRndInteger,
    Login,
    CheckSessions,
    saveSessions,
    loadSessions,
    SpawnLoc,
    heart,
    star,
    tree
};