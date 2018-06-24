import * as rp from 'request-promise';
import { IWeather } from '../models/weather';
import * as moment from 'moment';
import * as env from 'node-env-file';

if (process.env.NODE_ENV !== 'production') {
    env('./.env');
}

const weatherApiKey = process.env.weather_api_key;
const weatherApi = 'https://api.darksky.net/forecast';
const weatherIconUrl = 'https://uds-static.api.aero/weather/icon/lg/';

enum WeatherIcons {
    'partly-cloudy-night' = '35.png',
    'clear-day' = '01.png',
    'clear-night' = '33.png',
    'rain' = '18.png',
    'snow' = '22.png',
    'sleet' = '25.png',
    'wind' = '32.png',
    'fog' = '11.png',
    'cloudy' = '07.png',
    'partly-cloudy-day' = '03.png',
}

export class WeatherService {

    public async getByLocationAndTime(lat: number, lng: number, date: any): Promise<IWeather> {

        const unixtime = date.moment.unix();
        const url = `${weatherApi}/${weatherApiKey}/${lat},${lng},${unixtime}?units=si`;

        const options = {
            method: 'GET',
            uri: url,
            json: true,
        };

        const response = await rp(options);
        if (date.grain === 'hour') {
            return {
                ...response.currently,
                temperature: response.currently.temperature,
                longitude: response.longitude,
                latitude: response.latitude,
            };
        }
        return {
            ...response.daily.data[0],
            longitude: response.longitude,
            latitude: response.latitude,
        };

    }

    public getIconUrl(icon: string): string {
        return weatherIconUrl + WeatherIcons[icon];
    }

    public formatWeather(weather: IWeather, address: string) {
        const attachments = {
            thumb_url: weatherService.getIconUrl(weather.icon),
            color: '#28b395',
            mrkdwn_in: ['fields'],
            fields: [
                {
                    title: 'Weather forcast for ' + address,
                    value: `_${weather.summary}_`,
                    short: false,
                },
                weather.temperatureLow ? {
                    title: '',
                    value: '*Low:* `' + weather.temperatureLow.toFixed(0) + ' °C`',
                    short: true,
                } : null,
                weather.temperatureHigh ? {
                    title: '',
                    value: '*High:* `' + weather.temperatureHigh.toFixed(0) + ' °C`',
                    short: true,
                } : null,
                weather.temperature ? {
                    title: '',
                    value: '*Temperature:* `' + weather.temperature.toFixed(0) + ' °C`',
                    short: false,
                } : null,
                {
                    title: '',
                    value: '*Humidity:* `' + (weather.humidity * 100).toFixed(0) + ' %`',
                    short: true,
                },
                {
                    title: '',
                    value: '*Precip:* `' + (weather.precipProbability * 100).toFixed(0) + ' %`',
                    short: true,
                },
                {
                    title: '',
                    value: '*Pressure:* `' + weather.pressure.toFixed(0) + ' hPa`',
                    short: true,
                },
                {
                    title: '',
                    value: '*UV Index:* `' + weather.uvIndex.toFixed(0) + '`',
                    short: true,
                },
            ],
            footer: `<https://darksky.net/details/${weather.latitude},${weather.longitude}/${moment(weather.time * 1000).format('YYYY-MM-DD')}/ca12/en| Dark Sky>`,
            footer_icon: 'http://haverzine.com/wp-content/uploads/2014/01/Dark-Sky-logo-on-mevvy.com_.png',
            ts: (weather.time).toString(),
        };

        return attachments;
    }

}

const weatherService = new WeatherService();
export default weatherService;
