import { SlackController } from "botkit";
import newsService from '../services/news_service';

// var newsService = require('../services/news_service');


module.exports = (controller: SlackController) => {

    controller.hears(['get news'], 'direct_message', (bot, message) => {

        bot.createConversation(message, (err, convo) => {

            convo.addMessage({
                text: 'Here you go :man-tipping-hand::skin-tone-2:'
            }, 'end-conversation');


            newsService.get('rs').then((articles) => {

                convo.addMessage({
                    text: 'I\'m getting news for you, please wait for a second :simple_smile:',
                    action: 'get_news'
                }, '');

                let attachments = articles.map((article) => {
                    return {
                        thumb_url: article.urlToImage,
                        color: "#F35A00",
                        fields: [
                            {
                                title: article.title,
                                value: article.description.length > 120 ? article.description.substring(0, 117) + "..." : article.description,
                                short: false
                            },
                            {
                                value: '<' + article.url + '|go to site :rocket:>',
                                short: false
                            }
                        ],
                        footer: article.source.name.toLowerCase(),
                        footer_icon: article.url,
                        ts: new Date(article.publishedAt).getTime() / 1000,
                    }
                });

                convo.addMessage({
                    attachments: attachments,
                    action: 'end-conversation'
                }, 'get_news');
            });

            convo.activate();

        })
    });
}
