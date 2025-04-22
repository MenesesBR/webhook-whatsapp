const logger = require('../../../config/logger');
const BlipClient = require('./BlipClient');
const { v4: uuidv4 } = require('uuid');
const messageProcessor = require('../message/MessageProcessor');
const userRepository = require('../../../infrastructure/persistence/FileUserRepository');
const config = require('../../../config/environment');

class BlipMessageService {
    constructor() {
        this.messageQueue = new Map();
        this.clients = new Map();
        this.blipClient = BlipClient;
    }

    async initializeClient(userId, phoneNumberId) {
        try {
            if (this.clients.has(userId)) {
                logger.info(`Client already initialized for ${userId}`);
                return this.clients.get(userId);
            }

            // Remove o @c.us suffix do WhatsApp user ID
            const cleanUserId = userId.split('@')[0];
            
            // Busca o botId no repositório
            const botId = await userRepository.getBotIdByPhoneNumber(phoneNumberId);
            if (!botId) {
                throw new Error(`No botId found for phoneNumberId: ${phoneNumberId}`);
            }

            const blipUserId = `${cleanUserId}.${botId}@${config.blip.botDomain}`;

            // Verifica se o usuário já existe
            let user = await userRepository.getUser(cleanUserId, botId);

            let client;
            if (user) {
                // Se o usuário existe, conecta usando suas credenciais
                logger.info(`Connecting existing user: ${cleanUserId} with bot_id: ${botId}`);
                client = this.blipClient.createClient(blipUserId, user.password);
            } else {
                // Se o usuário não existe, cria um novo
                logger.info(`Creating new user: ${cleanUserId} with bot_id: ${botId}`);
                const password = this.blipClient.generateRandomPassword();
                client = this.blipClient.createClient(blipUserId, password);
                await userRepository.createUser({
                    userId: cleanUserId,
                    password: password,
                    botId: botId
                });
            }

            // Adiciona listener para mensagens recebidas do BLIP
            client.addMessageReceiver((message) => {
                if (message.type === 'application/vnd.lime.chatstate+json') {
                    logger.info('Received chat state change:', message);
                    return;
                }
                logger.info('Received message:', message);
                this.handleBlipResponse(message, userId);
            });

            // Conecta o cliente
            await client.connect();
            logger.info(`BLIP client connected for ${userId} with bot_id: ${botId}`);

            // Armazena o cliente e retorna também o botId
            this.clients.set(userId, { client, botId });
            return { client, botId };
        } catch (error) {
            logger.error('Error initializing BLIP client:', error);
            throw error;
        }
    }

    async handleBlipResponse(message, userId) {
        try {
            logger.info(`Received message from BLIP for ${userId}:`, message);
            await messageProcessor.processMessage(message, userId);
            this.messageQueue.delete(userId);
        } catch (error) {
            logger.error('Error handling BLIP response:', error);
        }
    }

    async sendMessage(message, userId, phoneNumberId) {
        try {
            // Inicializa o cliente se necessário
            const { client, botId } = await this.initializeClient(userId, phoneNumberId);
            const { text, interactive } = message;
            let messageText;

            // Adiciona a mensagem à fila de espera
            this.messageQueue.set(userId, {
                message,
                timestamp: Date.now()
            });

            if (interactive) {
                if (interactive.type === 'button_reply') {
                    messageText = interactive.button_reply.title;
                    logger.info(`Selected button: ${messageText}`);
                } else if (interactive.type === 'list_reply') {
                    messageText = interactive.list_reply.title;
                    logger.info(`Selected item: ${messageText}`);
                }
            } else if (text) {
                messageText = text.body;
            }

            if (!messageText) {
                return;
            }

            logger.info(`Sending message to BLIP for user ${userId}:`, messageText);

            const blipMessage = {
                id: uuidv4(),
                to: `${botId}@msging.net`,
                type: 'text/plain',
                content: messageText
            };

            await client.sendMessage(blipMessage);
            logger.info('Message sent successfully to BLIP');
            return true;
        } catch (error) {
            logger.error('Error sending message to BLIP:', {
                error: error.message,
                stack: error.stack,
                userId: userId,
                phoneNumberId: phoneNumberId,
                messageType: message.type,
                messageContent: message.text?.body || message.interactive?.type
            });
            return false;
        }
    }
}

module.exports = new BlipMessageService(); 