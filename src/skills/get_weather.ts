import { SlackController } from "botkit";
import weatherService from '../services/weather_service';

module.exports = (controller: SlackController) => {

    controller.hears(['get weather'], 'direct_message', (bot, message) => {

        bot.createConversation(message, (err, convo) => {

            convo.addMessage({
                text: 'Here you go :man-tipping-hand::skin-tone-2:'
            }, 'end-conversation');


            weatherService.get().then((weather) => {

                convo.addMessage({
                    text: 'I\'m getting weather forecast for you, please wait for a second :simple_smile:',
                    action: 'get_weather'
                }, '');

                let attachments = [{
                    thumb_url: weatherService.getIconUrl(weather.icon),
                    color: "#F35A00",
                    fields: [
                        {
                            title: 'Weather forcast',
                            value: weather.summary,
                            short: false
                        },
                        {
                            title: 'Min temperature',
                            value: weather.temperatureLow.toFixed(1) + ' °C',
                            short: true
                        },
                        {
                            title: 'Max temperature',
                            value: weather.temperatureHigh.toFixed(1) + ' °C',
                            short: true
                        }
                    ],
                    footer: `<https://darksky.net/forecast/${weather.latitude},${weather.longitude}| Dark Sky>`,
                    footer_icon: 'http://haverzine.com/wp-content/uploads/2014/01/Dark-Sky-logo-on-mevvy.com_.png',
                    ts: (weather.time).toString(),
                }];

                convo.addMessage({
                    attachments: attachments,
                    action: 'end-conversation'
                }, 'get_weather');
            });

            convo.activate();

        })
    });
}
