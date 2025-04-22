const logger = require('../../../config/logger');
const config = require('../../../config/environment');
const messageService = require('../../../core/services/message/MessageService');

class WebhookController {
    constructor() {
        // Bind methods to maintain 'this' context
        this.handleMessage = this.handleMessage.bind(this);
        this.handleReceivedMessage = this.handleReceivedMessage.bind(this);
        this.handleMessageStatus = this.handleMessageStatus.bind(this);
    }

    verifyWebhook(req, res) {
        try {
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];

            logger.info('Webhook verification attempt:', {
                mode: mode,
                token: token ? 'present' : 'missing',
                challenge: challenge ? 'present' : 'missing',
                expectedToken: config.webhook.verifyToken ? 'configured' : 'missing'
            });

            if (!mode || !token) {
                logger.warn('Missing required verification parameters:', {
                    mode: mode,
                    token: token ? 'present' : 'missing'
                });
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            if (!config.webhook.verifyToken) {
                logger.error('Verify token not configured in environment');
                return res.status(500).json({ error: 'Server configuration error' });
            }

            if (mode === 'subscribe' && token === config.webhook.verifyToken) {
                logger.info('Webhook verified successfully');
                return res.status(200).send(challenge);
            } else {
                logger.warn('Webhook verification failed:', {
                    mode: mode,
                    expectedMode: 'subscribe',
                    tokenMatch: token === config.webhook.verifyToken
                });
                return res.status(403).json({ 
                    error: 'Verification failed',
                    details: 'Invalid mode or token'
                });
            }
        } catch (error) {
            logger.error('Unexpected error during webhook verification:', {
                error: error.message,
                stack: error.stack,
                query: req.query
            });
            return res.status(500).json({ 
                error: 'Internal server error',
                message: error.message 
            });
        }
    }

    async handleMessage(req, res) {
        try {
            const body = req.body;
            logger.info('Received webhook notification:', {
                body: body,
                headers: req.headers,
                method: req.method,
                url: req.url
            });

            // Validate the incoming message structure
            if (!body || !body.entry || !Array.isArray(body.entry) || body.entry.length === 0) {
                logger.error('Invalid message structure received:', body);
                return res.status(400).json({ error: 'Invalid message structure' });
            }

            const entry = body.entry[0];
            if (!entry.changes || !Array.isArray(entry.changes) || entry.changes.length === 0) {
                logger.error('No changes found in message entry:', entry);
                return res.status(400).json({ error: 'No changes found in message entry' });
            }

            const change = entry.changes[0];
            const value = change.value;

            // Handle different types of notifications
            if (value.messages) {
                // This is a received message
                await this.handleReceivedMessage(value);
            } else if (value.statuses) {
                // This is a message status update (sent/delivered/read)
                await this.handleMessageStatus(value);
            } else {
                logger.warn('Unknown notification type received:', value);
            }

            // Always return 200 for valid webhook notifications
            res.status(200).send('EVENT_RECEIVED');
        } catch (error) {
            // Only log and return 500 for unexpected errors
            logger.error('Unexpected error handling webhook message:', {
                error: error.message,
                stack: error.stack
            });
            res.status(500).json({ 
                error: 'Internal server error',
                message: error.message 
            });
        }
    }

    async handleReceivedMessage(value) {
        try {
            if (!value.messages || !Array.isArray(value.messages) || value.messages.length === 0) {
                logger.warn('No messages found in change value:', value);
                return;
            }

            const message = value.messages[0];
            const userId = message.from;
            const phoneNumberId = value.metadata.phone_number_id;

            if (!userId) {
                logger.warn('No user ID found in message:', message);
                return;
            }

            logger.info('Processing received message:', {
                phoneNumberId: phoneNumberId,
                userId: userId,
                messageType: message.type,
                timestamp: message.timestamp
            });

            await messageService.processMessageSend(message, userId, phoneNumberId);
        } catch (error) {
            logger.error('Error processing received message:', {
                error: error.message,
                stack: error.stack
            });
            // Don't throw the error, just log it
        }
    }

    async handleMessageStatus(value) {
        try {
            if (!value.statuses || !Array.isArray(value.statuses) || value.statuses.length === 0) {
                logger.warn('No statuses found in change value:', value);
                return;
            }

            const status = value.statuses[0];
            logger.info('Message status update:', {
                messageId: status.id,
                status: status.status,
                timestamp: status.timestamp,
                recipientId: status.recipient_id
            });

            // Here you can add logic to handle different statuses
            // For example: update message status in your database
            switch (status.status) {
                case 'sent':
                    logger.info(`Message ${status.id} was sent to ${status.recipient_id}`);
                    break;
                case 'delivered':
                    logger.info(`Message ${status.id} was delivered to ${status.recipient_id}`);
                    break;
                case 'read':
                    logger.info(`Message ${status.id} was read by ${status.recipient_id}`);
                    break;
                case 'failed':
                    logger.error(`Message ${status.id} failed to send to ${status.recipient_id}:`, status.errors);
                    break;
            }
        } catch (error) {
            logger.error('Error processing message status:', {
                error: error.message,
                stack: error.stack
            });
            // Don't throw the error, just log it
        }
    }
}

module.exports = new WebhookController(); 