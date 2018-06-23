import { ISlackMessage } from '../models/Slack';
import { CategoryNews } from '../models/news';

export class WitService {

    public hears(pattern: string, message: ISlackMessage) {
        let isMatch = false;
        if (message.entities &&
            message.entities.intent &&
            message.entities.intent[0] &&
            message.entities.intent[0].value &&
            message.entities.intent[0].value === pattern[0]
        ) {
            isMatch = true;
        }
        return isMatch;
    }

    public getAddressEntity(entities: any) {
        let addressEntity = '';
        if (entities && entities.location && entities.location[0]) {
            addressEntity = entities.location[0].value;
        }
        return addressEntity;
    }

    public getNewsTypeEntity(entities: any): CategoryNews {
        let newsTypeEntity = '';
        if (entities && entities.news_type && entities.news_type[0]) {
            newsTypeEntity = entities.news_type[0].value;
        }
        return newsTypeEntity as CategoryNews;
    }

    public getDateTimeEntity(entities: any) {
        let dateEntity = '';
        if (entities && entities.datetime && entities.datetime[0]) {
            dateEntity = entities.datetime[0].value;
        }
        return dateEntity;
    }

}

const witService = new WitService();
export default witService;
