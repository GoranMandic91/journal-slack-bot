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
