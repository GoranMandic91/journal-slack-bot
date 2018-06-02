import * as debug from 'debug';
debug('botkit:incoming_webhooks');

export class IncomingWebhooksRoute {

  public controller: any;
  public webserver: any;

  constructor(webserver: any, controller: any) {
    this.controller = controller;
    this.webserver = webserver;
    this.configure();
  }

  public configure() {
    debug('Configured /slack/receive url');
    this.webserver.post('/slack/receive', (req, res) => {
      // NOTE: we should enforce the token check here
      res.status(200);

      // Now, pass the webhook into be processed
      this.controller.handleWebhookPayload(req, res);
    });
  }
}
