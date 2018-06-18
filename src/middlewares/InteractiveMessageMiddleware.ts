import { SlackController } from 'botkit';
import { ISlackMessage } from '../models/Slack';
export class InteractiveMessageMiddleware {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.middleware.receive.use((bot, message: ISlackMessage, next) => {
            if (message.type === 'interactive_message_callback') {
                if (message.actions[0].name.match(/^day_list$/)) {
                    bot.replyInteractive(message, {
                        text: 'Choosed `' + message.actions[0].selected_options[0].value + '`',
                    });
                }
                if (message.actions[0].name.match(/^hour_list$/)) {
                    bot.replyInteractive(message, {
                        text: 'Choosed `at ' + message.actions[0].selected_options[0].value + '`',
                    });
                }
            }
            next();

        });

        this.controller.middleware.receive.use((bot, message: ISlackMessage, next) => {
            if (message.type === 'interactive_message_callback') {
                if (message.actions[0].name.match(/^global_list$/)) {
                    bot.replyInteractive(message, {
                        text: 'Selected ' + message.actions[0].value,
                    });
                }
            }
            next();
        });

    }
}
