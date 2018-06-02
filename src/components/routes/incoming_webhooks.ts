// tslint:disable-next-line:no-var-keyword
var debug = require('debug')('botkit:incoming_webhooks');

module.exports = (webserver, controller) => {
  debug('Configured /slack/receive url');
  webserver.post('/slack/receive', (req, res) => {
    // NOTE: we should enforce the token check here
    res.status(200);

    // Now, pass the webhook into be processed
    controller.handleWebhookPayload(req, res);
  });
};
