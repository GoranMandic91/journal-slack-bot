import { SlackController } from 'botkit';
import * as prettyjson from 'prettyjson';
import * as Wit from 'botkit-middleware-witai';
import * as env from 'node-env-file';

if (process.env.NODE_ENV !== 'production') {
    env('./.env');
}

const wit = Wit({
    token: process.env.wit_access_token,
});

export class SampleMiddleware {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.middleware.receive.use((bot, message, next) => {

            console.log(prettyjson.render({ RECEIVED: message }, {
                keysColor: 'magenta',
                dashColor: 'white',
                stringColor: 'grey',
                inlineArrays: true,
            }));
            next();

        });

        this.controller.middleware.receive.use(wit.receive);

        this.controller.middleware.send.use((bot, message, next) => {

            console.log(prettyjson.render({ SEND: message }, {
                keysColor: 'blue',
                dashColor: 'white',
                stringColor: 'grey',
                inlineArrays: true,
            }));
            next();

        });
    }
}
