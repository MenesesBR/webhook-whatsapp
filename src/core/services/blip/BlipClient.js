const BlipSdk = require('blip-sdk');
const WebSocketTransport = require('lime-transport-websocket');
const { v4: uuidv4 } = require('uuid');
const config = require('../../../config/environment');
const logger = require('../../../infrastructure/config/logger');

class BlipClient {
    constructor() {
        this.wsUri = config.blip.wsUri;
        this.wsUriScheme = this.wsUri.match(/^(\w+):\/\//)[1];
        this.wsUriHostname = this.wsUri.match(/:\/\/([^:\/]+)([:\/]|$)/)[1];
        this.wsUriPort = this.wsUri.match(/:(\d+)/) ? this.wsUri.match(/:(\d+)/)[1] : 8081;
        this.domain = config.blip.botDomain;
    }

    createClient(identity, password) {
        logger.info(`Creating client for identity: ${identity}`);
        return new BlipSdk.ClientBuilder()
            .withIdentifier(identity)
            .withPassword(password)
            .withScheme(this.wsUriScheme)
            .withHostName(this.wsUriHostname)
            .withPort(this.wsUriPort)
            .withDomain(this.domain)
            .withTransportFactory(() => new WebSocketTransport())
            .build();
    }

    createGuestClient(identity) {
        logger.info(`Creating guest client for identity: ${identity}`);
        return new BlipSdk.ClientBuilder()
            .withScheme(this.wsUriScheme)
            .withHostName(this.wsUriHostname)
            .withPort(this.wsUriPort)
            .withDomain(this.domain)
            .withTransportFactory(() => {
                return new WebSocketTransport({
                    localNode: identity
                });
            })
            .build();
    }

    generateRandomPassword() {
        return Buffer.from(Math.random().toString()).toString('base64').slice(0, 8);
    }

    generateRandomIdentifier() {
        return `${uuidv4()}.${config.blip.botId}`;
    }
}

module.exports = new BlipClient(); 