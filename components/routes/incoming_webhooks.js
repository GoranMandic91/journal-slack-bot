var debug = require('debug')('botkit:incoming_webhooks');
var config = require('config');


if (config.has('token')) {
    var token = config.get('token');
}
module.exports = function (webserver, controller) {

    debug('Configured /slack/receive url');
    webserver.post('/slack/receive', function (req, res) {

        // NOTE: we should enforce the token check here
        if (req.body.token === token) {
            // respond to Slack that the webhook has been received.
            res.status(200);

            // Now, pass the webhook into be processed
            controller.handleWebhookPayload(req, res);
        } else {
            res.status(403);
        }


    });

}
