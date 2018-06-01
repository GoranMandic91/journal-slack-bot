import { User } from 'botkit';

export interface ISlackUser extends User {
    tasks?: string[];
}
