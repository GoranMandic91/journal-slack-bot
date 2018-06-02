import { User, SlackBot } from 'botkit';
export interface ISlackUser extends User {
    tasks?: string[];
}

export interface ISlackBot extends SlackBot {
    config?: any;
}
