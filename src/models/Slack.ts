import { Identity } from 'botkit';
import { User, SlackBot, Team, SlackMessage, SlackAttachment, SlackController } from 'botkit';

export interface ISlackTeam extends Team {
    createdBy?: string;
    url?: string;
    name?: string;
    domain?: string;
    email_domain?: string;
    icon?: ISlackTeamIcon;
    enterprise_id?: string;
    enterprise_name?: string;
    bot?: {
        token: string;
        user_id?: string;
        createdBy?: string;
        app_token?: string;
        name?: string;
    };
}
export interface ISlackTeamIcon {
    image_34?: string;
    image_44?: string;
    image_68?: string;
    image_88?: string;
    image_102?: string;
    image_132?: string;
    image_default?: boolean;
}
export interface ISlackUser extends User {
    tasks?: string[];
    team_id?: string;
    deleted?: boolean;
    color?: string;
    real_name?: string;
    tz?: string;
    tz_label?: string;
    tz_offset?: number;
    profile?: ISlackUserProfil;
    is_admin?: boolean;
    is_owner?: boolean;
    is_primary_owner?: boolean;
    is_restricted?: boolean;
    is_ultra_restricted?: boolean;
    is_bot?: boolean;
    updated?: number;
    is_app_user?: boolean;
    has_2fa?: boolean;
}

export interface ISlackUserProfil {
    avatar_hash?: string;
    status_text?: string;
    status_emoji?: string;
    real_name?: string;
    display_name?: string;
    real_name_normalized?: string;
    display_name_normalized?: string;
    email?: string;
    image_24?: string;
    image_32?: string;
    image_48?: string;
    image_72?: string;
    image_192?: string;
    image_512?: string;
    team?: string;
}

export interface ISlackBot extends SlackBot {
    config?: any;
    identity: ISlackIdentity;
    team_info?: ISlackTeam;
    access_token?: string;
    bot?: {
        bot_access_token?: string;
        bot_user_id?: string;
    };
}

export interface ISlackIdentity extends Identity {
    ok?: boolean;
    team?: string;
    team_id?: string;
    url?: string;
    user?: string;
    user_id?: string;
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
