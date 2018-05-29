import { SlackController } from "botkit";
interface SlackUser {
    id: string;
    name?: string;
    tasks?: string[];
}

module.exports = (controller: SlackController) => {

    // listen for someone saying 'tasks' to the bot
    // reply with a list of current tasks loaded from the storage system
    // based on this user's id
    controller.hears(['tasks', 'todo'], 'direct_message', (bot, message) => {

        // load user from storage...
        controller.storage.users.get(message.user, (err, user: SlackUser) => {

            // user object can contain arbitary keys. we will store tasks in .tasks
            if (!user || !user.tasks || user.tasks.length == 0) {
                bot.reply(message, 'There are no tasks on your list. Say `add _task_` to add something.');
            } else {

                var text = 'Here are your current tasks: \n' +
                    generateTaskList(user) +
                    'Reply with `done _number_` to mark a task completed.';

                bot.reply(message, text);

            }

        });

    });

    // listen for a user saying "add <something>", and then add it to the user's list
    // store the new list in the storage system
    controller.hears(['add (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

        var newtask = message.match[1];
        controller.storage.users.get(message.user, (err, user: SlackUser) => {

            if (!user) {
                user = {
                    id: message.user,
                    name: `<@${message.user}>`,
                    tasks: []
                };
            }

            user.tasks.push(newtask);

            controller.storage.users.save(user, (err, saved) => {

                if (err) {
                    bot.reply(message, 'I experienced an error adding your task: ' + err);
                } else {
                    bot.api.reactions.add({
                        name: 'thumbsup',
                        channel: message.channel,
                        timestamp: message.ts
                    }, () => { });
                }

            });
        });

    });

    // listen for a user saying "done <number>" and mark that item as done.
    controller.hears(['done (.*)'], 'direct_message', (bot, message) => {

        var number = +message.match[1];

        if (isNaN(number)) {
            bot.reply(message, 'Please specify a number.');
        } else {

            // adjust for 0-based array index
            number = number - 1;

            controller.storage.users.get(message.user, (err, user: SlackUser) => {

                if (!user) {
                    user = {
                        id: message.user,
                        tasks: [],
                    };

                }

                if (number < 0 || number >= user.tasks.length) {
                    bot.reply(message, 'Sorry, your input is out of range. Right now there are ' + user.tasks.length + ' items on your list.');
                } else {

                    var item = user.tasks.splice(number, 1);

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

        var text = '';

        for (var t = 0; t < user.tasks.length; t++) {
            text = text + '> `' + (t + 1) + '`) ' + user.tasks[t] + '\n';
        }

        return text;

    }
}
