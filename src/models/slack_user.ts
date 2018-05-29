import { User } from "botkit";

export interface SlackUser extends User {
    tasks?: string[];
}
