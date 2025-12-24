const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const LoginMessage = require('../packets/LoginMessage');

class XMLHandler {
    constructor(controller) {
        this.controller = controller;
    }

    handle(xml) {
        parser.parseString(xml, (err, result) => {
            if (err) {
                console.error('XML parse error:', err);
                return;
            }

            const body = result.msg?.body?.[0];
            const action = body?.$?.action;

            switch (action) {
                case 'rndK':
                    this.#handleRndK(body);
                    break;
            }
        });
    }

    #handleRndK(body) {
        const hash = body.k?.[0];
        this.controller.options.hash = hash;
        this.controller.sendRawMessage(LoginMessage.build(this.controller.options));
    }
}

module.exports = XMLHandler;
