# Webhook WhatsApp

Este é um servidor webhook para integração com a API do WhatsApp Business.

## Estrutura do Projeto

```
src/
├── config/
│   ├── environment.js
│   └── logger.js
├── interfaces/
│   └── http/
│       ├── controllers/
│       │   └── WebhookController.js
│       ├── middlewares/
│       │   └── RequestLogger.js
│       └── routes/
│           └── webhook.js
└── main.js
```

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as variáveis com seus valores:
  - `VERIFY_TOKEN`: Token de verificação do webhook (você define)
  - `META_AUTH_TOKEN`: Token de acesso da API do WhatsApp (obtenha no painel da Meta)
  - `PHONE_NUMBER_ID`: ID do número do WhatsApp (obtenha no painel da Meta)
  - `API_BASE_URL`: URL da API externa que processará as mensagens
  - `API_AUTH_TOKEN`: Token de autorização para a API externa
  - `PORT`: Porta em que o servidor irá rodar (opcional, padrão: 3000)

3. Configure o ngrok:
- Instale o ngrok: https://ngrok.com/download
- Configure seu authtoken: `ngrok authtoken seu_token_aqui`

## Uso

1. Inicie o servidor:
```bash
npm run dev
```

2. Em outro terminal, inicie o ngrok:
```bash
start-ngrok.bat
```

3. Configure o webhook no painel da Meta:
- URL: Use a URL fornecida pelo ngrok (exemplo: `https://seu-tunnel.ngrok.io/webhook`)
- Token de verificação: mesmo valor definido em `VERIFY_TOKEN`

## Funcionalidades

- Recebe mensagens do WhatsApp
- Encaminha mensagens para uma API externa
- Sistema de logging
- Rota de health check

## Arquitetura

O projeto segue uma arquitetura simples e focada:

- **Config**: Configurações do servidor e logging
- **Interfaces**: Controllers, rotas e middlewares HTTP

## Segurança

- Todas as configurações sensíveis são armazenadas em variáveis de ambiente
- Validação de token no webhook
- Tratamento de erros para evitar exposição de informações sensíveis 