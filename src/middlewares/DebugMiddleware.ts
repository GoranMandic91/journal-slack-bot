import { SlackController } from 'botkit';
import * as prettyjson from 'prettyjson';

export class DebugMiddleware {

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
