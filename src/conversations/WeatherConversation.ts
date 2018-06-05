import { SlackController } from 'botkit';
import weatherService from '../services/WeatherService';

export class WeatherConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.hears(['weather'], 'direct_message', (bot, message) => {

            bot.createConversation(message, (err, convo) => {

                convo.addMessage({
                    text: 'Here you go :man-tipping-hand::skin-tone-2:',
                }, 'end-conversation');

                weatherService.get().then((weather) => {

                    convo.addMessage({
                        text: 'I\'m getting weather forecast for you, please wait for a second :simple_smile:',
                        action: 'get_weather',
                    }, '');

                    const attachments = [{
                        thumb_url: weatherService.getIconUrl(weather.icon),
                        color: '#F35A00',
                        fields: [
                            {
                                title: 'Weather forcast',
                                value: weather.summary,
                                short: false,
                            },
                            {
                                title: 'Min temperature',
                                value: weather.temperatureLow.toFixed(0) + ' °C',
                                short: true,
                            },
                            {
                                title: 'Max temperature',
                                value: weather.temperatureHigh.toFixed(0) + ' °C',
                                short: true,
                            },
                        ],
                        footer: `<https://darksky.net/forecast/${weather.latitude},${weather.longitude}/ca12/en| Dark Sky>`,
                        footer_icon: 'http://haverzine.com/wp-content/uploads/2014/01/Dark-Sky-logo-on-mevvy.com_.png',
                        ts: (weather.time).toString(),
                    }];

                    convo.addMessage({
                        attachments,
                        action: 'end-conversation',
                    }, 'get_weather');
                });

                convo.activate();

            });
        });
    }
}
