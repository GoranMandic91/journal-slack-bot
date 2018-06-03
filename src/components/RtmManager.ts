import * as debug from 'debug';
debug('botkit:rtm_manager');

export class RtmManager {

    private managed_bots = {};
    private controller: any;

    constructor(controller: any) {
        this.controller = controller;
        this.configureStart();
        this.configureClose();
    }

    public configureStart() {
        // Capture the rtm:start event and actually start the RTM...
        this.controller.on('rtm:start', (config) => {
            const bot = this.controller.spawn({ token: config.config.token, send_via_rtm: true });
            this.start(bot);
        });
    }
    public configureClose() {

        this.controller.on('rtm_close', (bot) => {
            this.remove(bot);
        });
    }

    private start(bot) {

        if (this.managed_bots[bot.config.token]) {
            debug('Start RTM: already online');
        } else {
            bot.startRTM((err, bot) => {
                if (err) {
                    debug('Error starting RTM:', err);
                } else {
                    this.managed_bots[bot.config.token] = bot.rtm;
                    debug('Start RTM: Success');
                }
            });
        }
    }

    private stop(bot) {
        if (this.managed_bots[bot.config.token]) {
            if (this.managed_bots[bot.config.token].rtm) {
                debug('Stop RTM: Stopping bot');
                this.managed_bots[bot.config.token].closeRTM();
            }
        }
    }

    private remove(bot) {
        debug('Removing bot from manager');
        delete this.managed_bots[bot.config.token];
    }

    private reconnect() {

        debug('Reconnecting all existing bots...');
        this.controller.storage.teams.all((err, list) => {

            if (err) {
                throw new Error('Error: Could not load existing bots:' + err);
            } else {
                for (let l = 0; l < list.length; l++) {
                    this.start(this.controller.spawn(list[l].bot));
                }
            }

        });

    }
}
