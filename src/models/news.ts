export interface INews {
    source?: ISource;
    author?: string;
    title?: string;
    description?: string;
    url?: string;
    urlToImage?: string;
    publishedAt?: string;
}

export interface ISource {
    id?: string;
    name?: string;
}
export enum CategoryNews {
    business = 'business',
    entertainment = 'entertainment',
    health = 'health',
    science = 'science',
    sports = 'sports',
    technology = 'technology',
}

export const CountryList = [
    'ae', // UAE
    'ar', // Argentina
    'at', // Austria
    'au', // Australia
    'be', // Belgium
    'bg', // Bulgaria
    'br', // Brazil
    'ca', // Canada
    'ch', // Switzerland
    'cn', // China
    'co', // Colombia
    'cu', // Cuba
    'cz', // Czech Republic
    'de', // Germany
    'eg', // Egypt
    'fr', // France
    'gb', // United Kingdom
    'gr', // Greece
    'hk', // Hong Kong
    'hu', // Hungary
    'id', // Indonesia
    'ie', // Ireland
    'il', // Israel
    'in', // India
    'it', // Italy
    'jp', // Japan
    'kr', // South Korea
    'lt', // Lithuania
    'lv', // Latvia
    'ma', // Marocco
    'mx', // Mexico
    'my', // Malaysia
    'ng', // Nigeria
    'nl', // Netherlands
    'no', // Norway
    'nz', // New Zeland
    'ph', // Philippines
    'pl', // Poland
    'pt', // Portugal
    'ro', // Romania
    'rs', // Serbia
    'ru', // Russia
    'sa', // Saudia Arabia
    'se', // Sweden
    'sg', // Singapore
    'si', // Slovenia
    'sk', // Slovakia
    'th', // Thailand
    'tr', // Turkey
    'tw', // Taiwan
    'ua', // Ukraine
    'us', // United States
    've', // Venezuela
    'za', // South Africa
];
