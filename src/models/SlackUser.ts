import { SlackMessage, SlackAttachment } from 'botkit';
import { User, SlackBot } from 'botkit';
export interface ISlackUser extends User {
    tasks?: string[];
}

export interface ISlackBot extends SlackBot {
    config?: any;
}

export interface ISlackMessage extends SlackMessage {
    actions?: IAction[];
    original_message?: ISlackMessage;
    attachments?: ISlackAttachment[];
}

export interface ISlackAttachment extends SlackAttachment {
    actions?: IAction[];
}
export interface IAction {
    name?: string;
    type?: string;
    value?: string;
}
