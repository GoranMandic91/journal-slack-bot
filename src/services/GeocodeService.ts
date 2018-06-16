import { IAddress } from './../models/address';
import * as rp from 'request-promise';
import * as utf8 from 'utf8';
import * as env from 'node-env-file';

if (process.env.NODE_ENV !== 'production') {
    env('./.env');
}

const GOOGLE_API_KEY = process.env.google_api_key;

export class GeocodeService {

    public async geocode(address: string): Promise<IAddress> {

        const encodedAddress = utf8.encode(address);

        const opts = {
            method: 'GET',
            uri: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodedAddress + `&key=${GOOGLE_API_KEY}`,
            json: true,
        };

        try {
            const response = await rp(opts);
            if (response.status !== 'OK' || response.results.length === 0) {
                return null;
            }
            return {
                city: this.extractFromAddressLongName(response.results[0].address_components, 'locality'),
                formatted_address: response.results[0].formatted_address,
                country: this.extractFromAddressLongName(response.results[0].address_components, 'country'),
                country_code: this.extractFromAddressShortName(response.results[0].address_components, 'country').toLowerCase(),
                location: response.results[0].geometry.location,
            };

        } catch (err) {
            console.log(err);
            return null;
        }
    }

    private extractFromAddressLongName(components, type) {
        for (let i = 0; i < components.length; i++) {
            for (let j = 0; j < components[i].types.length; j++) {
                if (components[i].types[j] === type) {
                    return components[i].long_name;
                }
            }
        }

        return '';
    }

    private extractFromAddressShortName(components, type) {
        for (let i = 0; i < components.length; i++) {
            for (let j = 0; j < components[i].types.length; j++) {
                if (components[i].types[j] === type) {
                    return components[i].short_name;
                }
            }
        }

        return '';
    }
}

const geocodeService = new GeocodeService();
export default geocodeService;
