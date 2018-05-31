import * as rp from 'request-promise';
const newsApi = 'https://newsapi.org/v2/';
const newsApiKey = "c97755a57d604ed4b373a02350980f3f";

export class NewsService {

    constructor() { }

    get(query: string): Promise<any> {
        const url = `https://newsapi.org/v2/top-headlines?country=${query}&pageSize=2&apiKey=${newsApiKey}`
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
