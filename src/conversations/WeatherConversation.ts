import { SlackController } from 'botkit';
import weatherService from '../services/WeatherService';
import * as Wit from 'botkit-middleware-witai';
import geocodeService from '../services/GeocodeService';
import * as moment from 'moment';

const wit = Wit({
    token: 'NG7AOCFDFQWNBOJDTUM2ZV63DGLKX5D7',
});

export class WeatherConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.controller.middleware.receive.use(wit.receive);
        this.configure();

    }

    public configure() {

        this.controller.hears(['weather'], 'direct_message', this.customHearsHandler, (bot, message: any) => {

            bot.createConversation(message, async (err, convo) => {

                const entities = message.intents[0].entities;
                const address = await geocodeService.geocode(entities.location[0].value);
                const date = entities.datetime && entities.datetime[0] ? entities.datetime[0].value : '';

                let time;
                if (date) {
                    time = moment(date);
                } else {
                    time = moment();
                }

                convo.addMessage({
                    text: 'Here you go :man-tipping-hand::skin-tone-2:',
                }, 'end-conversation');

                weatherService.getByLocationAndTime(address.location.lat, address.location.lng, time).then((weather) => {

                    convo.addMessage({
                        text: 'I\'m getting weather forecast for you, please wait for a second :simple_smile:',
                        action: 'get_weather',
                    }, '');

                    const attachments = weatherService.formatWeather(weather, address.address);

                    convo.addMessage({
                        attachments,
                        action: 'end-conversation',
                    }, 'get_weather');
                });

                convo.activate();

            });
        });
    }

    public customHearsHandler(test: string, message: any) {
        let isMatch = false;
        if (message.intents && message.intents[0] && message.intents[0].entities && message.intents[0].entities.intent) {
            message.intents[0].entities.intent.forEach((intent) => {
                isMatch = intent.value.match(test);
            });
        }
        return isMatch;
    }
}
