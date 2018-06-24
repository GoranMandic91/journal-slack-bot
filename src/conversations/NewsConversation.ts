import { CategoryNews } from './../models/news';
import { SlackController, Conversation } from 'botkit';
import { CountryList } from '../models/news';
import newsService from '../services/NewsService';
import { ISlackMessage } from '../models/Slack';
import geocodeService from '../services/GeocodeService';
import witService from '../services/WitService';

export class NewsConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {
        this.controller.hears(['news'], 'direct_message', witService.hears, (bot, message: ISlackMessage) => {
            bot.createConversation(message, async (err, convo) => {

                let addressEntity = witService.getAddressEntity(message.entities);
                const newsTypeEntity1 = witService.getNewsTypeEntity(message.entities);

                if (!addressEntity) {

                    convo.say({ text: 'Hmm :thinking_face:' });
                    convo.say({ text: 'I need location :earth_africa:' });
                    convo.ask({
                        text: 'Give me country name from which you want me to get you news :slightly_smiling_face:',
                    }, async (response: ISlackMessage, convo) => {
                        addressEntity = witService.getAddressEntity(response.entities);
                        const address = await geocodeService.geocode(addressEntity);

                        let newsTypeEntity2 = witService.getNewsTypeEntity(response.entities);
                        newsTypeEntity2 = newsTypeEntity2 ? newsTypeEntity2 : newsTypeEntity1;

                        this.send(convo, address, newsTypeEntity2);
                        convo.next();
                    });
                    convo.activate();

                } else {

                    const address = await geocodeService.geocode(addressEntity);
                    this.send(convo, address, newsTypeEntity1);
                    convo.activate();

                }

            });
        });
    }

    public async send(convo: Conversation<ISlackMessage>, address: any, news_type?: CategoryNews) {

        if (!address || CountryList.indexOf(address.country_code) === -1) {
            const formatAddress = address && address.formatted_address ? ', *' + address.formatted_address + '*, ' : ' ';
            convo.say({
                text: 'I can\'t get you news. Given country' + formatAddress + 'is not supported :disappointed:',
            });
        } else {
            convo.addMessage({
                text: 'Here you go :man-tipping-hand::skin-tone-2:',
            }, 'end_conversation');

            await newsService.get(address.country_code, news_type).then((articles) => {

                convo.addMessage({
                    text: `I\'m getting ${news_type} news for you, please wait for a second :simple_smile:`,
                    action: 'get_news',
                }, '');

                const attachments = newsService.formatNews(articles);

                convo.addMessage({
                    attachments,
                    action: 'end_conversation',
                }, 'get_news');
            });
        }

    }

}
