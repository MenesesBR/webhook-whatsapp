require('dotenv').config();

module.exports = {
    server: {
        port: process.env.PORT || 3000
    },
    webhook: {
        verifyToken: process.env.VERIFY_TOKEN
    },
    api: {
        baseUrl: process.env.API_BASE_URL,
        authToken: process.env.API_AUTH_TOKEN
    },
    mongodb: {
        url: process.env.MONGODB_URL,
        blipBotUsersDatabase: process.env.MONGODB_BLIP_BOT_USERS_DATABASE,
        clientsDataDatabase: process.env.MONGODB_CLIENTS_DATA_DATABASE,
        clientsDataCollection: process.env.MONGODB_CLIENTS_DATA_COLLECTION
    }
}; 