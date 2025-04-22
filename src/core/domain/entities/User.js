class User {
    constructor(userId, password, botId, additionalData = {}) {
        this.userId = userId;
        this.password = password;
        this.botId = botId;
        this.createdAt = additionalData.createdAt || new Date().toISOString();
        this.lastInteraction = additionalData.lastInteraction || new Date().toISOString();
        this.status = additionalData.status || 'active';
        this.metadata = additionalData.metadata || {};
    }

    static create(userId, password, botId, additionalData = {}) {
        return new User(userId, password, botId, additionalData);
    }

    toJSON() {
        return {
            userId: this.userId,
            password: this.password,
            botId: this.botId,
            createdAt: this.createdAt,
            lastInteraction: this.lastInteraction,
            status: this.status,
            metadata: this.metadata
        };
    }
}

module.exports = User; 