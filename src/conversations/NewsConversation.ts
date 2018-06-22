import { CategoryNews } from './../models/news';
import { SlackController, Conversation } from 'botkit';
import { INews, CountryList } from '../models/news';
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
                let news_type;
                let addressEntity = this.getAddressEntity(message.entities);
                const newsTypeEntity = this.getNewsTypeEntity(message.entities);

                if (!addressEntity) {

                    convo.say({ text: 'Hmm :thinking_face:' });
                    convo.say({ text: 'I need location :earth_africa:' });
                    convo.ask({
                        text: 'Give me country name from which you want me to get you news :slightly_smiling_face:',
                    }, async (response: ISlackMessage, convo) => {
                        addressEntity = this.getAddressEntity(response.entities);
                        news_type = this.getNewsTypeEntity(response.entities);

                        news_type = news_type ? news_type : newsTypeEntity;
                        address = await geocodeService.geocode(addressEntity);
                        this.send(convo, address, true, news_type);
                    });
                    convo.activate();

                } else {

                    address = await geocodeService.geocode(addressEntity);
                    this.send(convo, address, false, newsTypeEntity);
                }

            });
        });
    }

    public async send(convo: Conversation<ISlackMessage>, address: any, next: boolean, news_type?: CategoryNews) {

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
                    text: 'I\'m getting news for you, please wait for a second :simple_smile:',
                    action: 'get_news',
                }, '');

                const attachments = newsService.formatNews(articles);

                convo.addMessage({
                    attachments,
                    action: 'end_conversation',
                }, 'get_news');
            });
        }

        if (next) {
            convo.next();
        } else {
            convo.activate();
        }
    }

    public customHearsHandler(pattern: string, message: ISlackMessage) {
        let isMatch = false;
        if (message.entities && message.entities.intent && message.entities.intent[0] && message.entities.intent[0].value && message.entities.intent[0].value === pattern[0]) {
            isMatch = true;
        }
        return isMatch;
    }

    private getAddressEntity(entities: any) {
        let addressEntity = '';
        if (entities && entities.location && entities.location[0]) {
            addressEntity = entities.location[0].value;
        }
        return addressEntity;
    }

    private getNewsTypeEntity(entities: any): CategoryNews {
        let newsTypeEntity = '';
        if (entities && entities.news_type && entities.news_type[0]) {
            newsTypeEntity = entities.news_type[0].value;
        }
        return newsTypeEntity as CategoryNews;
    }

}
