const { v4: uuidv4 } = require('uuid');
const blipClient = require('./BlipClient');
const logger = require('../../../infrastructure/config/logger');

class BlipConnection {
    constructor() {
        this.clients = new Map();
    }

    async connectAsNewUser(identity, password) {
        logger.info('Initiating connection as new user...');
        const guestIdentifier = uuidv4();
        const guestClient = await blipClient.createGuestClient(identity);
        
        logger.info('Connecting as guest...');
        const guestNode = `${guestIdentifier}@${blipClient.domain}/default`;
        await guestClient.connectWithGuest(guestIdentifier);
        logger.info('Guest connection established');

        const createAccountCommand = {
            id: uuidv4(),
            from: identity,
            pp: guestNode,
            method: 'set',
            type: 'application/vnd.lime.account+json',
            uri: '/account',
            resource: {
                password: password
            }
        };

        logger.info('Creating account...');
        await guestClient.sendCommand(createAccountCommand);
        logger.info('Account created successfully');

        return this.connect(identity, password);
    }

    async connectWithPassword(identity, password) {
        logger.info(`Connecting client with identity: ${identity}`);
        const client = await blipClient.createClient(identity, password);
        await client.connectWithPassword(identity, password);
        logger.info('Client connected successfully');
        return client;
    }

    async connect(identity, password) {
        logger.info(`Connecting client with identity: ${identity}`);
        const client = await blipClient.createClient(identity, password);
        await client.connect();
        logger.info('Client connected successfully');
        return client;
    }

    async ping(client) {
        try {
            const pingCommand = {
                id: uuidv4(),
                method: 'get',
                uri: '/ping'
            };
            await client.sendCommand(pingCommand);
            logger.info('Ping successful');
            return true;
        } catch (error) {
            logger.error('Ping failed:', error);
            return false;
        }
    }

    getClient(userId) {
        return this.clients.get(userId);
    }

    setClient(userId, client) {
        this.clients.set(userId, client);
    }
}

module.exports = new BlipConnection(); 