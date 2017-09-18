const Plivo = require('plivo');
const Session = require('../session');
const BaseClient = require('./base-client');

// Currently this client only supports texts but in the future could support calls
class PlivoClient extends BaseClient {
  init() {
    const defaults = {
      api_id: process.env.PLIVO_API_ID,
      api_token: process.env.PLIVO_API_TOKEN,
      phone_number: process.env.PLIVO_PHONE_NUMBER,
    };

    this.config = Object.assign({}, defaults, this.config);
    this.plivo = Plivo.RestAPI({
      authId: this.config.api_id,
      authToken: this.config.api_token
    });

    this.bot.on('webhook', this.createWebhookHandler());
  }

  createEventHandler() {
    return (req, res, next) => {
      // If this isn't a websocket request then carry on with other handlers
      if (!{}.hasOwnProperty.call(req.query, 'plivo')) {
        next();
        return;
      }

      // TODO: Implement For Plivo
    };
  }

  createWebhookHandler() {
    return (req, res, next) => {
      // If this isn't a twillio request then carry on with other handlers
      if (req.headers['x-plivo-cloud']) {
        next();
        return;
      }

      const data = Object.assign({}, req.query, req.body);

      const message = {
        text: data.Body,
      };

      const session = new Session(this.bot, data.From, this);

      this.bot.trigger('message_received', message, session);
      res.send({}); // We can't send a success code as twillio will send it

      return session;
    };
  }

  send(session, text) {
    this.plivo.sendMessage({
      to: session.user,
      from: this.config.phone_number,
      body: text,
    });
  }
}

module.exports = PlivoClient;
