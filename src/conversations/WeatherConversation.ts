import { ISlackMessage } from './../models/Slack';
import { SlackController, Conversation } from 'botkit';
import weatherService from '../services/WeatherService';
import geocodeService from '../services/GeocodeService';
import * as moment from 'moment';

export class WeatherConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();

    }

    public configure() {

        this.controller.hears(['weather'], 'direct_message', this.customHearsHandler, (bot, message: any) => {

            bot.createConversation(message, async (err, convo) => {

                let addressEntity = this.getAddressEntity(message.intents);
                const date = this.getDateEntity(message.intents);
                let address;
                let time;

                if (!addressEntity) {

                    convo.say({ text: 'Hmm :thinking_face:' });
                    convo.say({ text: 'I need location :earth_africa:' });
                    convo.ask({
                        text: 'Please give me location for weather forecast :slightly_smiling_face:',
                    }, async (response: ISlackMessage, convo) => {
                        addressEntity = this.getAddressEntity(response.intents);
                        address = await geocodeService.geocode(addressEntity);
                        time = date ? moment(date) : moment();
                        this.send(convo, address, time, true);
                    });
                    convo.activate();

                } else {

                    address = await geocodeService.geocode(addressEntity);
                    time = date ? moment(date) : moment();
                    this.send(convo, address, time, false);

                }

            });
        });
    }

    public async send(convo: Conversation<ISlackMessage>, address: any, time: any, next: boolean) {

        if (!address) {
            convo.addMessage({
                text: 'I can\'t get you forecast for given location :disappointed:',
            }, '');
        } else {
            convo.addMessage({
                text: 'Here you go :man-tipping-hand::skin-tone-2:',
            }, 'end-conversation');

            await weatherService.getByLocationAndTime(address.location.lat, address.location.lng, time).then((weather) => {

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
            if (next) {
                convo.next();
            } else {
                convo.activate();
            }
        }
    }

    public customHearsHandler(test: string, message: ISlackMessage) {
        let isMatch = false;
        if (message.intents && message.intents[0] && message.intents[0].entities && message.intents[0].entities.intent) {
            message.intents[0].entities.intent.forEach((intent) => {
                isMatch = intent.value.match(test);
            });
        }
        return isMatch;
    }

    private getAddressEntity(intents: any) {
        let addressEntity = '';
        if (intents && intents[0] && intents[0].entities && intents[0].entities.location && intents[0].entities.location[0]) {
            addressEntity = intents[0].entities.location[0].value;
        }
        return addressEntity;
    }

    private getDateEntity(intents: any) {
        let dateEntity = '';
        if (intents && intents[0] && intents[0].entities && intents[0].entities.datetime && intents[0].entities.datetime[0]) {
            dateEntity = intents[0].entities.datetime[0].value;
        }
        return dateEntity;
    }
}
