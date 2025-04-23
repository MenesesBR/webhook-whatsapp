const logger = require('../../../config/logger');

const requestLogger = (req, res, next) => {
    logger.info(`[REQUEST] ${req.method} ${req.url}`);
    next();
};

module.exports = requestLogger; 