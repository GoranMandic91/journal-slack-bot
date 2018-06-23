import { CategoryNews } from './../models/news';
import * as rp from 'request-promise';
import { INews } from '../models/news';
import * as env from 'node-env-file';

if (process.env.NODE_ENV !== 'production') {
    env('./.env');
}

const newsApi = 'https://newsapi.org/v2/';
const newsApiKey = process.env.news_api_key;

export class NewsService {

    public async get(country: string, category?: CategoryNews): Promise<INews[]> {

        let url = `${newsApi}/top-headlines?country=${country}&pageSize=5&apiKey=${newsApiKey}`;
        if (category) {
            url = `${newsApi}/top-headlines?country=${country}&category=${category}&pageSize=5&apiKey=${newsApiKey}`;
        }

        const options = {
            method: 'GET',
            uri: url,
            json: true,
        };

        const response = await rp(options);
        return response.articles;

    }

    public formatNews(news: INews[]) {
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
        return attachments;
    }

}

const newsService = new NewsService();
export default newsService;
