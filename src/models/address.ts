export interface IAddress {
    city?: string;
    address?: string;
    country?: string;
    country_code?: string;
    location?: ILocation;
}

export interface ILocation {
    lat?: number;
    lng?: number;
}
