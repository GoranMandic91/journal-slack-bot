import { SlackController } from 'botkit';
import * as Wit from 'botkit-witai';
import * as env from 'node-env-file';

if (process.env.NODE_ENV !== 'production') {
    env('./.env');
}

export const wit = Wit({
    accessToken: process.env.wit_access_token,
});

export class WitMiddleware {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.middleware.receive.use(wit.receive);

    }
}
