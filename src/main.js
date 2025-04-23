const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/environment');
const logger = require('./config/logger');
const webhookRoutes = require('./interfaces/http/routes/webhook');
const requestLogger = require('./interfaces/http/middlewares/RequestLogger');

const app = express();
const port = config.server.port;

// Log das configurações
logger.info('Starting server with configuration:', {
    port: port,
    hasMetaToken: !!config.meta.authToken,
    hasPhoneNumberId: !!config.meta.phoneNumberId,
    hasVerifyToken: !!config.webhook.verifyToken,
    hasApiUrl: !!config.api.baseUrl,
    hasApiToken: !!config.api.authToken
});

// Middleware para logging de requisições
app.use(requestLogger);

// Middleware para parsing do corpo das requisições
app.use(bodyParser.json());

// Rotas do webhook
app.use('/', webhookRoutes);

// Rota de health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Iniciar o servidor
const server = app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
});

// Tratamento de erros do servidor
server.on('error', (error) => {
    logger.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
    }
}); 