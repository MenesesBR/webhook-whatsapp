require('dotenv').config();

module.exports = {
    server: {
        port: process.env.PORT || 3000
    },
    webhook: {
        verifyToken: process.env.VERIFY_TOKEN
    },
    blipSdkApi: {
        baseUrl: process.env.BLIP_SDK_API_BASE_URL,
        jwtUserName: process.env.BLIP_SDK_API_JWT_USER_NAME,
        jwtUserPassword: process.env.BLIP_SDK_API_JWT_USER_PASSWORD
    },
    mongodb: {
        url: process.env.MONGODB_URL,
        blipBotUsersDatabase: process.env.MONGODB_BLIP_BOT_USERS_DATABASE,
        clientsDataDatabase: process.env.MONGODB_CLIENTS_DATA_DATABASE,
        clientsDataCollection: process.env.MONGODB_CLIENTS_DATA_COLLECTION
    }
}; 