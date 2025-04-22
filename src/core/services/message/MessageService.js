const logger = require('../../../config/logger');
const blipMessageService = require('../blip/BlipMessageService');
const messageProcessor = require('./MessageProcessor');

class MessageService {
    async processMessageSend(message, userId, phoneNumberId) {
        try {
            logger.log(`Starting message processing for ${userId}`);
            
            // Envia a mensagem para o BLIP
            const success = await blipMessageService.sendMessage(message, userId, phoneNumberId);
            
            if (success) {
                logger.log(`Message sent successfully to BLIP: ${userId}`);
                return true;
            } else {
                logger.error(`Failed to send message to BLIP: ${userId}`);
                return false;
            }
        } catch (error) {
            logger.error(`Error processing message for ${userId}`, error);
            return false;
        }
    }

    async processBlipResponse(message, userId) {
        try {
            return await messageProcessor.processMessage(message, userId);
        } catch (error) {
            logger.error('Error processing BLIP response', error);
            return false;
        }
    }
}

module.exports = new MessageService(); 