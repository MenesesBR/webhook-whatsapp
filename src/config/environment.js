require('dotenv').config();

module.exports = {
    server: {
        port: process.env.PORT || 3000
    },
    meta: {
        authToken: process.env.META_AUTH_TOKEN,
        phoneNumberId: process.env.PHONE_NUMBER_ID
    },
    webhook: {
        verifyToken: process.env.VERIFY_TOKEN
    },
    api: {
        baseUrl: process.env.API_BASE_URL,
        authToken: process.env.API_AUTH_TOKEN
    }
}; 