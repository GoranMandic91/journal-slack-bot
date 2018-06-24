import { ISlackUser, } from './../models/Slack';
import weatherService from '../services/WeatherService';
import newsService from '../services/NewsService';
import * as moment from 'moment';

const Cron = require('cron').CronJob;

export class CronConversation {

    private controller: any;
    private runningCrons: any[];

    constructor(controller: any) {
        this.controller = controller;
        this.runningCrons = [];
        this.configure();
        this.configureCronRestart();
    }

    public configure() {

        this.controller.storage.teams.find({}, (err, teams) => {
            console.log('initializing cron...');
            if (err) {
                console.log(err);
            } else {
                teams.forEach((team) => {
                    const bot = this.controller.spawn(team.bot);
                    this.controller.storage.users.find({}, (err, users) => {

                        users.forEach((user: ISlackUser) => {
                            if (user.is_active_journal && user.cron && user.cron.pattern) {
                                const userCron = new Cron(user.cron.pattern, () => {
                                    bot.api.im.open({ user: user.id }, (err, response) => {
                                        if (err) {
                                            bot.botkit.log('Failed to open IM with user', err);
                                        }
                                        bot.startConversation({
                                            user: user.id,
                                            channel: response.channel.id,
                                            text: ' ',
                                        }, async (err, convo) => {
                                            if (!err) {
                                                const [news, weather] = await Promise.all([
                                                    newsService.get(user.address.country_code),
                                                    weatherService.getByLocationAndTime(user.address.location.lat, user.address.location.lng, { moment: moment(), grain: 'day' }),
                                                ]);

                                                const attachments = newsService.formatNews(news);
                                                attachments.unshift(weatherService.formatWeather(weather, user.address.formatted_address));

                                                convo.addMessage({
                                                    text: 'I\'m getting news and weather forecast for you, please wait for a second :simple_smile:',
                                                    action: 'get_both',
                                                }, '');

                                                convo.addMessage({
                                                    attachments,
                                                    action: 'end_conversation',
                                                }, 'get_both');

                                                convo.addMessage({
                                                    text: 'Here you go :man-tipping-hand::skin-tone-2:',
                                                }, 'end_conversation');

                                                convo.activate();
                                            } else {
                                                console.log('Error with cron convo ', err);
                                            }
                                        });
                                    });
                                }, null, true, 'Europe/Belgrade');
                                this.runningCrons.push(userCron);
                            }
                        });
                    });
                });
            }
        });
    }

    public configureCronRestart() {
        this.controller.on('cron:restart', () => {
            this.runningCrons.forEach((cron) => {
                cron.stop();
                cron = null;
            });
            this.runningCrons = [];
            this.configure();
        });
    }
}
