import * as rp from 'request-promise';
import { IWeather } from '../models/weather';

const weatherApi = 'https://api.darksky.net/forecast';
const weatherApiKey = '00979ce26509f1f656df89fcb8282edf';
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

    public get(): Promise<IWeather> {
        const url = `${weatherApi}/${weatherApiKey}/44.80401,20.46513?units=si`;
        const options = {
            method: 'GET',
            uri: url,
            json: true,
        };
        return rp(options)
            .then((response) => {
                return { ...response.daily.data[0], longitude: response.longitude, latitude: response.latitude };
            });
    }

    public getByLocationAndTime(lat: number, lng: number, date: any): Promise<IWeather> {
        const unixtime = date.unix();
        const url = `${weatherApi}/${weatherApiKey}/${lat},${lng},${unixtime}?units=si`;
        const options = {
            method: 'GET',
            uri: url,
            json: true,
        };
        return rp(options)
            .then((response) => {
                return { ...response.daily.data[0], longitude: response.longitude, latitude: response.latitude };
            });
    }

    public getIconUrl(icon: string): string {
        return weatherIconUrl + WeatherIcons[icon];
    }

    public formatWeather(weather: IWeather, address: string) {
        const attachments = [{
            thumb_url: weatherService.getIconUrl(weather.icon),
            color: '#F35A00',
            fields: [
                {
                    title: 'Weather forcast for ' + address,
                    value: weather.summary,
                    short: false,
                },
                {
                    title: 'Min temperature',
                    value: weather.temperatureLow.toFixed(0) + ' °C',
                    short: true,
                },
                {
                    title: 'Max temperature',
                    value: weather.temperatureHigh.toFixed(0) + ' °C',
                    short: true,
                },
            ],
            footer: `<https://darksky.net/forecast/${weather.latitude},${weather.longitude}/ca12/en| Dark Sky>`,
            footer_icon: 'http://haverzine.com/wp-content/uploads/2014/01/Dark-Sky-logo-on-mevvy.com_.png',
            ts: (weather.time).toString(),
        }];

        return attachments;
    }

}

const weatherService = new WeatherService();
export default weatherService;
