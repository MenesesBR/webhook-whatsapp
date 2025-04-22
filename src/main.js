const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/environment');
const logger = require('./config/logger');
const webhookRoutes = require('./interfaces/http/routes/webhook');
const requestLogger = require('./interfaces/http/middlewares/RequestLogger');

const app = express();
const port = config.server.port;

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

// Iniciar o servidor
app.listen(port, () => {
    logger.log(`Server started on port ${port}`);
}); 