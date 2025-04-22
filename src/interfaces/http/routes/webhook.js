const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/WebhookController');
const logger = require('../../../config/logger');

router.use((req, res, next) => {
    logger.info(`Webhook request: ${req.method} ${req.url}`);
    next();
});

router.get('/', WebhookController.verifyWebhook);

router.post('/', WebhookController.handleMessage);

module.exports = router; 