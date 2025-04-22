require('dotenv').config();

module.exports = {
    server: {
        port: process.env.PORT || 3000
    },
    meta: {
        authToken: process.env.META_AUTH_TOKEN,
        phoneNumberId: process.env.PHONE_NUMBER_ID
    },
    blip: {
        botDomain: process.env.BOT_DOMAIN,
        wsUri: 'wss://ws.0mn.io:443'
    },
    webhook: {
        verifyToken: process.env.VERIFY_TOKEN
    }
}; 