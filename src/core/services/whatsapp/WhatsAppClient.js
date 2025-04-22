const axios = require('axios');
const config = require('../../../config/environment');
const logger = require('../../../infrastructure/config/logger');

class WhatsAppClient {
    constructor() {
        this.baseUrl = `https://graph.facebook.com/v22.0/${config.meta.phoneNumberId}/messages`;
        this.headers = {
            Authorization: `Bearer ${config.meta.authToken}`,
            'Content-Type': 'application/json'
        };
    }

    async sendMessage(to, message) {
        try {
            const response = await axios.post(
                this.baseUrl,
                {
                    messaging_product: 'whatsapp',
                    to,
                    type: 'text',
                    text: {
                        preview_url: false,
                        body: message
                    }
                },
                {
                    headers: this.headers
                }
            );
            return response.data;
        } catch (error) {
            logger.error('Error sending WhatsApp message', error);
            throw error;
        }
    }

    async sendInteractiveMessage(to, text, buttons) {
        try {
            // Limita o texto a 1024 caracteres
            const truncatedText = text.length > 1024 ? text.substring(0, 1021) + '...' : text;
            
            // Limita o número de botões a 3
            const limitedButtons = buttons.slice(0, 3);
            
            // Limita o texto de cada botão a 20 caracteres
            const formattedButtons = limitedButtons.map(button => ({
                type: 'reply',
                reply: {
                    id: button.text.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20),
                    title: button.text.substring(0, 20)
                }
            }));
            
            const message = {
                messaging_product: 'whatsapp',
                to,
                type: 'interactive',
                interactive: {
                    type: 'button',
                    body: {
                        text: truncatedText
                    },
                    action: {
                        buttons: formattedButtons
                    }
                }
            };
            
            logger.info(`Sending interactive message to ${to} with ${formattedButtons.length} buttons`);
            logger.info(`Message text: ${truncatedText}`);
            logger.info(`Buttons: ${JSON.stringify(formattedButtons)}`);
            
            const response = await axios.post(
                this.baseUrl,
                message,
                {
                    headers: this.headers
                }
            );
            
            logger.info(`API response for interactive message: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            logger.error('Error sending interactive message', error);
            if (error.response) {
                logger.info(`Error details: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    async sendListMessage(to, text, listMessage) {
        try {
            // Limita o texto a 1024 caracteres
            const truncatedText = text.length > 1024 ? text.substring(0, 1021) + '...' : text;
            
            // Limita o título a 24 caracteres
            const truncatedTitle = listMessage.title.length > 24 ? listMessage.title.substring(0, 21) + '...' : listMessage.title;
            
            // Limita a descrição a 72 caracteres
            const truncatedDescription = listMessage.description.length > 72 ? listMessage.description.substring(0, 69) + '...' : listMessage.description;
            
            // Formata as seções da lista
            const formattedSections = listMessage.sections.map(section => {
                // Limita o título da seção a 24 caracteres
                const truncatedSectionTitle = section.title.length > 24 ? section.title.substring(0, 21) + '...' : section.title;
                
                // Limita o número de itens a 10 por seção
                const limitedItems = section.items.slice(0, 10);
                
                // Formata os itens da seção
                const formattedItems = limitedItems.map(item => {
                    // Limita o título do item a 24 caracteres
                    const truncatedItemTitle = item.title.length > 24 ? item.title.substring(0, 21) + '...' : item.title;
                    
                    return {
                        id: item.next_step,
                        title: truncatedItemTitle
                    };
                });
                
                return {
                    title: truncatedSectionTitle,
                    rows: formattedItems
                };
            });
            
            const message = {
                messaging_product: 'whatsapp',
                to,
                type: 'interactive',
                interactive: {
                    type: 'list',
                    header: {
                        type: 'text',
                        text: truncatedTitle
                    },
                    body: {
                        text: truncatedText
                    },
                    action: {
                        button: 'Ver opções',
                        sections: formattedSections
                    }
                }
            };
            
            logger.info(`Sending list message to ${to}`);
            logger.info(`Title: ${truncatedTitle}`);
            logger.info(`Description: ${truncatedDescription}`);
            logger.info(`Sections: ${JSON.stringify(formattedSections)}`);
            
            const response = await axios.post(
                this.baseUrl,
                message,
                {
                    headers: this.headers
                }
            );
            
            logger.info(`API response for list message: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            logger.error('Error sending list message', error);
            if (error.response) {
                logger.info(`Error details: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
}

module.exports = new WhatsAppClient(); 