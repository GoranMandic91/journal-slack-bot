import { SlackController } from 'botkit';

export class UsersConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.hears(['users'], 'direct_message', (bot, message) => {

            bot.createConversation(message, (err, convo) => {

                convo.addMessage({
                    text: 'I\'m getting all users, please wait for a second :simple_smile:',
                    action: 'get-all-users',
                }, '');

                convo.addMessage({
                    text: 'Here you go :man-tipping-hand::skin-tone-2:',
                }, 'end-conversation');

                bot.api.users.list({}, (error, response) => {

                    const currentDate = Date.now() / 1000;

                    const members = response.members.filter((member) => {
                        return !member.is_bot && member.id !== 'USLACKBOT';
                    });

                    const attachments = members.map((member) => {
                        return {
                            author_name: member.real_name,
                            author_icon: member.profile.image_24,
                            thumb_url: member.profile.image_72,
                            color: member.color,
                            fields: [
                                {
                                    title: 'e-mail',
                                    value: member.profile.email,
                                    short: false,
                                },
                                {
                                    title: 'username',
                                    value: '<@' + member.id + '>',
                                    short: false,
                                },
                            ],
                            footer: 'Journal Bot',
                            footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
                            ts: currentDate,
                        };
                    });

                    convo.addMessage({
                        attachments,
                        action: 'end-conversation',
                    }, 'get-all-users');
                });

                convo.activate();

            });
        });
    }
}
