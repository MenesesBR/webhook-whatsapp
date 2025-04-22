class UserRepository {
    async getUser(userId, botId) {
        throw new Error('Method not implemented');
    }

    async createUser(user) {
        throw new Error('Method not implemented');
    }

    async updateUser(userId, data, botId) {
        throw new Error('Method not implemented');
    }

    async getBotIdByPhoneNumber(phoneNumberId) {
        throw new Error('Method not implemented');
    }
}

module.exports = UserRepository; 