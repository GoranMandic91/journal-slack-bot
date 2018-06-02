import { SlackController } from 'botkit';
import { INews } from '../models/news';
import newsService from '../services/NewsService';
import weatherService from '../services/WeatherService';

export class JournalConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.hears(['get both'], 'direct_message', (bot, message) => {

            bot.createConversation(message, async (err, convo) => {

                convo.addMessage({
                    text: 'Here you go :man-tipping-hand::skin-tone-2:',
                }, 'end-conversation');

                const [news, weather] = await Promise.all([
                    newsService.get('rs'),
                    weatherService.get(),
                ]);

                convo.addMessage({
                    text: 'I\'m getting news and weather forecast for you, please wait for a second :simple_smile:',
                    action: 'get_both',
                }, '');

                const attachments = news.map((article: INews) => {
                    return {
                        thumb_url: article.urlToImage,
                        color: '#28b395',
                        fields: [
                            {
                                title: article.title,
                                value: article.description,
                                short: false,
                            },
                        ],
                        footer: `<${article.url}| ${article.source.name.toLowerCase()}>`,
                        footer_icon: 'https://newsapi.org/images/n-logo-border.png',
                        ts: (new Date(article.publishedAt).getTime() / 1000).toString(),
                    };
                });

                attachments.unshift({
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
                            value: weather.temperatureLow.toFixed(1) + ' °C',
                            short: true,
                        },
                        {
                            title: 'Max temperature',
                            value: weather.temperatureHigh.toFixed(1) + ' °C',
                            short: true,
                        },
                    ],
                    footer: `<https://darksky.net/forecast/${weather.latitude},${weather.longitude}| Dark Sky>`,
                    footer_icon: 'http://haverzine.com/wp-content/uploads/2014/01/Dark-Sky-logo-on-mevvy.com_.png',
                    ts: (weather.time).toString(),
                });

                convo.addMessage({
                    attachments,
                    action: 'end-conversation',
                }, 'get_both');

                convo.activate();

            });
        });
    }
}
