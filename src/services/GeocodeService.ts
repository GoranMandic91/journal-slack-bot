import * as rp from 'request-promise';
import * as utf8 from 'utf8';

const GOOGLE_API_KEY = 'AIzaSyC-ftJE0pEN4PNwp8NxvHimU9KJofEM04A';

export class GeocodeService {

    public async geocode(address: string) {

        const encodedAddress = utf8.encode(address);

        const opts = {
            method: 'GET',
            uri: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodedAddress + `&key=${GOOGLE_API_KEY}`,
            json: true,
        };

        try {
            const response = await rp(opts);
            if (response.status !== 'OK') {
                return null;
            }
            return {
                city: this.extractFromAdress(response.results[0].address_components, 'locality'),
                address: response.results[0].formatted_address,
                country: this.extractFromAdress(response.results[0].address_components, 'country'),
                location: response.results[0].geometry.location,
            };

        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public extractFromAdress(components, type) {
        for (let i = 0; i < components.length; i++) {
            for (let j = 0; j < components[i].types.length; j++) {
                if (components[i].types[j] === type) {
                    return components[i].long_name;
                }
            }
        }

        return '';
    }
}

const geocodeService = new GeocodeService();
export default geocodeService;
