import { SlackController } from 'botkit';

// tslint:disable-next-line:no-var-requires
const wordfilter = require('wordfilter');

export class SampleHearsSkill {

  private controller: SlackController;
  private triggers: number;
  private convos: number;

  constructor(controller: SlackController) {
    this.controller = controller;
    this.triggers = 0;
    this.convos = 0;
    this.configure();
  }

  public configure() {
    this.controller.on('heard_trigger', () => {
      this.triggers++;
    });

    this.controller.on('conversationStarted', () => {
      this.convos++;
    });

    this.controller.hears(['^uptime', '^debug'], 'direct_message,direct_mention', (bot, message) => {
      bot.createConversation(message, (err, convo) => {
        if (!err) {
          convo.setVar('uptime', this.formatUptime(process.uptime()));
          convo.setVar('convos', this.convos);
          convo.setVar('triggers', this.triggers);

          convo.say(
            'My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.'
          );
          convo.activate();
        }
      });
    }
    );

    this.controller.hears(['^say (.*)', '^say'], 'direct_message,direct_mention', (bot, message) => {
      if (message.match[1]) {
        if (!wordfilter.blacklisted(message.match[1])) {
          this.controller.storage.users.get(message.user, (err, user) => {
            if (user && user.name) {
              bot.reply(
                message,
                'Hello ' + user.name + '!' + ' Here you go: ' + message.match[1]
              );
            } else {
              bot.reply(message, 'Hello.' + ' Here you go: ' + message.match[1]);
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
  }

  private formatUptime(uptime) {
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

}
