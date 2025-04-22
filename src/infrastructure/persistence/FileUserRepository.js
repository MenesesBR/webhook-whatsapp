const fs = require('fs').promises;
const path = require('path');
const User = require('../../core/domain/entities/User');
const UserRepository = require('../../core/domain/repositories/UserRepository');
const logger = require('../config/logger');

class FileUserRepository extends UserRepository {
    constructor() {
        super();
        this.usersFile = path.join(__dirname, '../../data/users.json');
        this.users = {};
        this.phoneNumberToBotId = new Map();
        this.initialize();
    }

    async initialize() {
        try {
            await fs.mkdir(path.dirname(this.usersFile), { recursive: true });
            try {
                const data = await fs.readFile(this.usersFile, 'utf8');
                this.users = JSON.parse(data);
                this.buildPhoneNumberToBotIdMap();
                logger.info('Users data loaded successfully');
            } catch (error) {
                logger.warn('No users file found, creating new one');
                this.users = {
                    contractNumbers: {}
                };
                await this.saveUsers();
            }
        } catch (error) {
            logger.error('Error initializing FileUserRepository', error);
        }
    }

    buildPhoneNumberToBotIdMap() {
        if (this.users.contractNumbers) {
            for (const phoneNumberId in this.users.contractNumbers) {
                const contractData = this.users.contractNumbers[phoneNumberId];
                if (contractData.botId) {
                    this.phoneNumberToBotId.set(phoneNumberId, contractData.botId);
                }
            }
        }
    }

    async saveUsers() {
        try {
            await fs.writeFile(this.usersFile, JSON.stringify(this.users, null, 2));
        } catch (error) {
            logger.error('Error saving users', error);
        }
    }

    async getBotIdByPhoneNumber(phoneNumberId) {
        return this.phoneNumberToBotId.get(phoneNumberId) || null;
    }

    async getUser(userId, botId) {
        try {
            // Procura em todos os contractNumbers
            for (const phoneNumberId in this.users.contractNumbers) {
                const contractData = this.users.contractNumbers[phoneNumberId];
                if (contractData.botId === botId && contractData.users && contractData.users[userId]) {
                    const userData = contractData.users[userId];
                    return User.create(userId, userData.password, botId, {
                        createdAt: userData.createdAt,
                        lastInteraction: userData.lastInteraction,
                        status: userData.status,
                        metadata: userData.metadata
                    });
                }
            }
            return null;
        } catch (error) {
            logger.error('Error getting user', error);
            return null;
        }
    }

    async createUser(user) {
        try {
            // Procura o contractNumber que tem o botId correspondente
            let targetContractNumber = null;
            for (const phoneNumberId in this.users.contractNumbers) {
                if (this.users.contractNumbers[phoneNumberId].botId === user.botId) {
                    targetContractNumber = phoneNumberId;
                    break;
                }
            }

            if (!targetContractNumber) {
                logger.error(`No contractNumber found for botId: ${user.botId}`);
                return null;
            }

            // Cria a estrutura de users se não existir
            if (!this.users.contractNumbers[targetContractNumber].users) {
                this.users.contractNumbers[targetContractNumber].users = {};
            }

            // Adiciona o usuário com todos os campos
            this.users.contractNumbers[targetContractNumber].users[user.userId] = {
                password: user.password,
                createdAt: user.createdAt || new Date().toISOString(),
                lastInteraction: user.lastInteraction || new Date().toISOString(),
                status: user.status || 'active',
                metadata: user.metadata || {}
            };

            await this.saveUsers();
            return user;
        } catch (error) {
            logger.error('Error creating user', error);
            return null;
        }
    }

    async updateUser(userId, data, botId) {
        try {
            // Procura o contractNumber que tem o botId correspondente
            for (const phoneNumberId in this.users.contractNumbers) {
                const contractData = this.users.contractNumbers[phoneNumberId];
                if (contractData.botId === botId && contractData.users && contractData.users[userId]) {
                    // Atualiza apenas os campos fornecidos, mantendo os existentes
                    contractData.users[userId] = {
                        ...contractData.users[userId],
                        ...data,
                        lastInteraction: new Date().toISOString() // Sempre atualiza a última interação
                    };
                    await this.saveUsers();
                    return User.create(userId, contractData.users[userId].password, botId, contractData.users[userId]);
                }
            }
            return null;
        } catch (error) {
            logger.error('Error updating user', error);
            return null;
        }
    }
}

module.exports = new FileUserRepository(); 