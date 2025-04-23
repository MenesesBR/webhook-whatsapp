const { MongoClient } = require('mongodb');
const logger = require('../../config/logger');
const config = require('../../config/environment');

class MongoDB {
    constructor() {
        this.dbConnections = new Map();

        // Bind methods to maintain 'this' context
        this.getDbConnection = this.getDbConnection.bind(this);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
    }

    // Function to safely get a database connection
    getDbConnection(name) {
        const connection = this.dbConnections.get(name);
        if (!connection) {
            logger.error(`Database connection '${name}' not found`);
            throw new Error(`Database connection '${name}' not found`);
        }
        return connection;
    }

    async connect() {
        try {
            const client = new MongoClient(config.mongodb.url);
            await client.connect();

            logger.info(`Connected to MongoDB: ${config.mongodb.url}`);

            const blipBotUsersDatabase = client.db(config.mongodb.blipBotUsersDatabase);
            const blipBotUsers = await blipBotUsersDatabase.listCollections().toArray();
            const blipBotCollections = {};

            for (const { name } of blipBotUsers) {
                const collection = blipBotUsersDatabase.collection(name);
                const documents = await collection.find({}).toArray();

                // Transforma ObjectId em string para evitar problemas com JSON
                const sanitizedDocs = documents.map(doc => ({
                    ...doc,
                    _id: doc._id.toString()
                }));

                blipBotCollections[name] = sanitizedDocs;
            }

            const clientsDataDatabase = client.db(config.mongodb.clientsDataDatabase);
            const clientsData = await clientsDataDatabase.listCollections().toArray();
            const clientsDataCollections = {};

            for (const { name } of clientsData) {
                const collection = clientsDataDatabase.collection(name);
                const documents = await collection.find({}).toArray();

                // Transforma ObjectId em string para evitar problemas com JSON
                const sanitizedDocs = documents.map(doc => ({
                    ...doc,
                    _id: doc._id.toString()
                }));

                clientsDataCollections[name] = sanitizedDocs;
            }

            this.dbConnections.set('blipBotCollections', blipBotCollections);
            this.dbConnections.set('clientsDataCollections', clientsDataCollections);

            logger.info(`Connected to Database: ${config.mongodb.blipBotUsersDatabase}`);
            logger.info(`Connected to Database: ${config.mongodb.clientsDataDatabase}`);

        } catch (error) {
            logger.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    async createUser(userPhoneNumber, password, clientBotId) {
        try {
            logger.info(`Creating user: ${userPhoneNumber} for bot: ${clientBotId}`);
            const client = new MongoClient(config.mongodb.url);
            await client.connect();

            const blipBotUsersDatabase = client.db(config.mongodb.blipBotUsersDatabase);

            const blipBotUsersCollection = blipBotUsersDatabase.collection(clientBotId);
            await blipBotUsersCollection.insertOne({
                phoneNumber: userPhoneNumber,
                password
            });

            await client.close();
            await this.connect();
        } catch (error) {
            logger.error('Error creating user:', error);
            throw error;
        }
    }

    async disconnect() {
        for (const [name, connection] of this.dbConnections) {
            try {
                await connection.client.close();
                logger.info(`Closed connection: ${name}`);
            } catch (error) {
                logger.error(`Error closing connection ${name}:`, error);
            }
        }
        this.dbConnections.clear();
    }
}

// Exporta uma única instância do MongoDB
module.exports = new MongoDB(); 