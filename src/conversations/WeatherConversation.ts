import { ISlackMessage } from '../models/Slack';
import { SlackController, Conversation } from 'botkit';
import weatherService from '../services/WeatherService';
import geocodeService from '../services/GeocodeService';
import witService from '../services/WitService';
import * as moment from 'moment';

export class WeatherConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();

    }

    public configure() {

        this.controller.hears(['weather'], 'direct_message', witService.hears, (bot, message: any) => {

            bot.createConversation(message, async (err, convo) => {

                let addressEntity = witService.getAddressEntity(message.entities);
                const date = witService.getDateTimeEntity(message.entities);
                let address;
                let time;

                if (!addressEntity) {

                    convo.say({ text: 'Hmm :thinking_face:' });
                    convo.say({ text: 'I need location :earth_africa:' });
                    convo.ask({
                        text: 'Please give me location for weather forecast :slightly_smiling_face:',
                    }, async (response: ISlackMessage, convo) => {
                        addressEntity = witService.getAddressEntity(response.entities);
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
            convo.say({
                text: 'I can\'t get you forecast for given location :disappointed:',
            });
        } else {
            convo.addMessage({
                text: 'Here you go :man-tipping-hand::skin-tone-2:',
            }, 'end-conversation');

            await weatherService.getByLocationAndTime(address.location.lat, address.location.lng, time).then((weather) => {

                convo.addMessage({
                    text: 'I\'m getting weather forecast for you, please wait for a second :simple_smile:',
                    action: 'get_weather',
                }, '');

                const attachments = [weatherService.formatWeather(weather, address.formatted_address)];

                convo.addMessage({
                    attachments,
                    action: 'end-conversation',
                }, 'get_weather');
            });
        }
        if (next) {
            convo.next();
        } else {
            convo.activate();
        }
    }

}
