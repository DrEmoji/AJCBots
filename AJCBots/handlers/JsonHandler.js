const clc = require('cli-color');

class XTHandler {
    constructor(controller) {
        this.controller = controller;
    }

    handle(json) {
        switch (true) {
            case json?.b?.o?.params?.hasOwnProperty('dbUserId'): {
                this.#handleUserData(json);
                break;
            }
        }
    }

    #handleUserData(json) {
       if (json?.b?.o?.params?.hasOwnProperty('playerWallSettings')) {
        this.controller.Log(clc.green("Login Packet Successful!"));
       }
       else {
        this.controller.Log(clc.redBright("Auth Packet Failed!!"));
       }
    }
}

module.exports = XTHandler;
