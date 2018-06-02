import { SlackController } from 'botkit';

// tslint:disable-next-line:no-var-requires
const wordfilter = require('wordfilter');

module.exports = (controller: SlackController) => {
  const stats = {
    triggers: 0,
    convos: 0,
  };

  controller.on('heard_trigger', () => {
    stats.triggers++;
  });

  controller.on('conversationStarted', () => {
    stats.convos++;
  });

  controller.hears(['^uptime', '^debug'], 'direct_message,direct_mention', (bot, message) => {
    bot.createConversation(message, (err, convo) => {
      if (!err) {
        convo.setVar('uptime', formatUptime(process.uptime()));
        convo.setVar('convos', stats.convos);
        convo.setVar('triggers', stats.triggers);

        convo.say(
          'My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.'
        );
        convo.activate();
      }
    });
  }
  );

  controller.hears(['^say (.*)', '^say'], 'direct_message,direct_mention', (bot, message) => {
    if (message.match[1]) {
      if (!wordfilter.blacklisted(message.match[1])) {
        controller.storage.users.get(message.user, (err, user) => {
          if (user && user.name) {
            bot.reply(
              message,
              'Hello ' + user.name + '!' + 'Here you go:' + message.match[1]
            );
          } else {
            bot.reply(message, 'Hello.' + ' Here you go:' + message.match[1]);
          }
        });
      } else {
        bot.reply(message, '_sigh_');
      }
    } else {
      bot.reply(message, 'I will repeat whatever you say.');
    }
  }
  );

  function formatUptime(uptime) {
    let unit = 'second';
    if (uptime > 60) {
      uptime = uptime / 60;
      unit = 'minute';
    }
    if (uptime > 60) {
      uptime = uptime / 60;
      unit = 'hour';
    }
    if (uptime !== 1) {
      unit = unit + 's';
    }

    uptime = parseInt(uptime, 10) + ' ' + unit;
    return uptime;
  }
};
