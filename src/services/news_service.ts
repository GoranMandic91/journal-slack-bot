import * as rp from 'request-promise';
import { News } from '../models/news';
const newsApi = 'https://newsapi.org/v2/';
const newsApiKey = "c97755a57d604ed4b373a02350980f3f";

export class NewsService {

    constructor() { }

    get(query: string): Promise<News[]> {
        const url = `https://newsapi.org/v2/top-headlines?country=${query}&pageSize=5&apiKey=${newsApiKey}`
        const options = {
            method: "GET",
            uri: url,
            json: true
        }
        return rp(options)
            .then(response => {
                return response.articles;
            })
    }


}

const newsService = new NewsService();
export default newsService;
