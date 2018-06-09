import { SlackController, Conversation } from 'botkit';
import { INews, CountryList } from '../models/News';
import newsService from '../services/NewsService';
import { ISlackMessage } from '../models/Slack';
import geocodeService from '../services/GeocodeService';

export class NewsConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {
        this.controller.hears(['news'], 'direct_message', this.customHearsHandler, (bot, message: ISlackMessage) => {
            bot.createConversation(message, async (err, convo) => {

                let address;
                let addressEntity = this.getAddressEntity(message.intents);

                if (!addressEntity) {

                    convo.say({ text: 'Hmm :thinking_face:' });
                    convo.say({ text: 'I need location :earth_africa:' });
                    convo.ask({
                        text: 'Please give me location for news :slightly_smiling_face:',
                    }, async (response: ISlackMessage, convo) => {
                        addressEntity = this.getAddressEntity(response.intents);
                        address = await geocodeService.geocode(addressEntity);
                        this.send(convo, address, true);
                    });
                    convo.activate();

                } else {

                    address = await geocodeService.geocode(addressEntity);
                    this.send(convo, address, false);
                }

            });
        });
    }

    public async send(convo: Conversation<ISlackMessage>, address: any, next: boolean) {

        if (!address || CountryList.indexOf(address.country_code) === -1) {
            const formatAddress = address && address.address ? ', ' + address.address + ', ' : ' ';
            convo.addMessage({
                text: 'I can\'t get you news. Given location' + formatAddress + 'is not supported :disappointed:',
            }, '');
            convo.activate();
        } else {
            convo.addMessage({
                text: 'Here you go :man-tipping-hand::skin-tone-2:',
            }, 'end_conversation');

            await newsService.get(address.country_code).then((articles) => {

                convo.addMessage({
                    text: 'I\'m getting news for you, please wait for a second :simple_smile:',
                    action: 'get_news',
                }, '');

                const attachments = newsService.formatNews(articles);

                convo.addMessage({
                    attachments,
                    action: 'end_conversation',
                }, 'get_news');
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

}
