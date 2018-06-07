import * as rp from 'request-promise';
import { INews } from '../models/news';
import * as env from 'node-env-file';

if (process.env.NODE_ENV !== 'production') {
    env('./.env');
}

const newsApi = 'https://newsapi.org/v2/';
const newsApiKey = process.env.news_api_key;

export class NewsService {

    public get(query: string): Promise<INews[]> {
        const url = `${newsApi}/top-headlines?country=${query}&pageSize=5&apiKey=${newsApiKey}`;
        const options = {
            method: 'GET',
            uri: url,
            json: true,
        };
        return rp(options)
            .then((response) => {
                return response.articles;
            });
    }

}

const newsService = new NewsService();
export default newsService;
