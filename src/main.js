const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/environment');
const logger = require('./config/logger');
const webhookRoutes = require('./interfaces/http/routes/webhook');
const requestLogger = require('./interfaces/http/middlewares/RequestLogger');
const mongodb = require('./infrastructure/database/mongodb');

const app = express();
const port = process.env.PORT;

// Log das configurações
logger.info('Starting server with configuration:', {
    port: port,
    hasVerifyToken: !!config.webhook.verifyToken,
    mongodbUrl: config.mongodb.url,
    blipSdkApiUrl: config.blipSdkApi.baseUrl,
    blipSdkApiJwtUserName: config.blipSdkApi.jwtUserName,
    blipSdkApiJwtUserPassword: config.blipSdkApi.jwtUserPassword,
    mongodbDatabase: config.mongodb.database
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
const server = app.listen(port, async () => {
    try {
        // Conectar ao MongoDB
       await mongodb.connect();

        logger.info(`Server started on port ${port}`);
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
});

// Tratamento de erros do servidor
server.on('error', (error) => {
    logger.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
    }
});

// Tratamento de encerramento gracioso
process.on('SIGINT', async () => {
    logger.info('Shutting down server...');
    await mongodb.disconnect();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
}); 