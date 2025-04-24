const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getLogFileName() {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        return `whatsapp-webhook-${date}.log`;
    }

    formatLogMessage(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${type}] ${message}\n`;
    }

    saveLog(message) {
        const logFile = path.join(this.logDir, this.getLogFileName());
        fs.appendFileSync(logFile, message);
    }

    formatMessage(...args) {
        return args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            return arg;
        }).join(' ');
    }

    log(...args) {
        const message = this.formatMessage(...args);
        const formattedMessage = this.formatLogMessage(message);
        this.saveLog(formattedMessage);
        console.log(message);
    }

    info(...args) {
        this.log(...args);
    }

    error(...args) {
        const message = this.formatMessage(...args);
        const formattedMessage = this.formatLogMessage(message, 'ERROR');
        this.saveLog(formattedMessage);
        console.error(message);
    }
}

// Create and export a single instance of the Logger
const logger = new Logger();
module.exports = logger; 