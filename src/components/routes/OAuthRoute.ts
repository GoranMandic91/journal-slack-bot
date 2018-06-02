import * as debug from 'debug';
debug('botkit:oauth');

export class OAuthRoute {

    public controller: any;
    public webserver: any;

    constructor(webserver: any, controller: any) {
        this.webserver = webserver;
        this.controller = controller;
        this.configureLogin();
        this.configureOAuth();
    }

    // Create a /login link
    // This link will send user's off to Slack to authorize the app
    public configureLogin() {
        debug('Configured /login url');
        this.webserver.get('/login', (req, res) => {
            res.redirect(this.controller.getAuthorizeURL());
        });

    }

    // Create a /oauth link
    // This is the link that receives the postback from Slack's oauth system
    public configureOAuth() {
        debug('Configured /oauth url');
        this.webserver.get('/oauth', (req, res) => {
            const code = req.query.code;
            const state = req.query.state;

            // we need to use the Slack API, so spawn a generic bot with no token
            const slackapi = this.controller.spawn({});

            const opts = {
                client_id: this.controller.config.clientId,
                client_secret: this.controller.config.clientSecret,
                code,
            };

            slackapi.api.oauth.access(opts, (err, auth) => {

                if (err) {
                    debug('Error confirming oauth', err);
                    return res.redirect('/error.html');
                }

                // what scopes did we get approved for?
                const scopes = auth.scope.split(/\,/);

                // use the token we got from the oauth
                // to call auth.test to make sure the token is valid
                // but also so that we reliably have the team_id field!
                slackapi.api.auth.test({ token: auth.access_token }, (err, identity) => {

                    if (err) {
                        debug('Error fetching user identity', err);
                        return res.redirect('/error.html');
                    }

                    auth.identity = identity;
                    this.controller.trigger('oauth:success', [auth]);

                    res.cookie('team_id', auth.team_id);
                    res.cookie('bot_user_id', auth.bot.bot_user_id);
                    res.redirect('/success.html');
                });
            });
        });
    }
}
