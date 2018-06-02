import { SlackController } from 'botkit';
import { ISlackUser } from '../models/SlackUser';

export class SampleTaskbotSkill {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        // listen for someone saying 'tasks' to the bot
        // reply with a list of current tasks loaded from the storage system
        // based on this user's id
        this.controller.hears(['tasks', 'todo'], 'direct_message', (bot, message) => {

            // load user from storage...
            this.controller.storage.users.get(message.user, (err, user: ISlackUser) => {

                // user object can contain arbitary keys. we will store tasks in .tasks
                if (!user || !user.tasks || user.tasks.length === 0) {
                    bot.reply(message, 'There are no tasks on your list. Say `add _task_` to add something.');
                } else {

                    const text = 'Here are your current tasks: \n' +
                        generateTaskList(user) +
                        'Reply with `done _number_` to mark a task completed.';

                    bot.reply(message, text);

                }

            });

        });

        // listen for a user saying 'add <something>', and then add it to the user's list
        // store the new list in the storage system
        this.controller.hears(['add (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

            const newtask = message.match[1];
            this.controller.storage.users.get(message.user, (err, user: ISlackUser) => {

                if (!user) {
                    user = {
                        id: message.user,
                        name: `<@${message.user}>`,
                        tasks: [],
                    };
                }

                user.tasks.push(newtask);

                this.controller.storage.users.save(user, (saved) => {

                    if (err) {
                        bot.reply(message, 'I experienced an error adding your task: ' + err);
                    } else {
                        bot.api.reactions.add({
                            name: 'thumbsup',
                            channel: message.channel,
                            timestamp: message.ts,
                        }, () => { console.log(''); });
                    }

                });
            });

        });

        // listen for a user saying 'done <number>' and mark that item as done.
        this.controller.hears(['done (.*)'], 'direct_message', (bot, message) => {

            let numbers = +message.match[1];

            if (isNaN(numbers)) {
                bot.reply(message, 'Please specify a number.');
            } else {

                // adjust for 0-based array index
                numbers = numbers - 1;

                this.controller.storage.users.get(message.user, (err, user: ISlackUser) => {

                    if (!user) {
                        user = {
                            id: message.user,
                            tasks: [],
                        };

                    }

                    if (numbers < 0 || numbers >= user.tasks.length) {
                        bot.reply(message, 'Sorry, your input is out of range. Right now there are ' + user.tasks.length + ' items on your list.');
                    } else {

                        const item = user.tasks.splice(numbers, 1);

                        // reply with a strikethrough message...
                        bot.reply(message, '~' + item + '~');

                        if (user.tasks.length > 0) {
                            bot.reply(message, 'Here are our remaining tasks:\n' + generateTaskList(user));
                        } else {
                            bot.reply(message, 'Your list is now empty!');
                        }
                    }
                });
            }

        });

        // simple function to generate the text of the task list so that
        // it can be used in various places
        function generateTaskList(user) {

            let text = '';

            for (let t = 0; t < user.tasks.length; t++) {
                text = text + '> `' + (t + 1) + '`) ' + user.tasks[t] + '\n';
            }

            return text;

        }
    }

}
