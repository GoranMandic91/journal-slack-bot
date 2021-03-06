import { ISlackAttachment, ISlackUser } from './../models/Slack';
import { DAY_REPEAT } from '../conversations/SettingsConversation';
import { SlackBot } from 'botkit';

export class SettingsService {

    public getGlobalAttachment(user: ISlackUser): ISlackAttachment[] {
        const attachment = [{
            callback_id: '123',
            color: '#28b395',
            attachment_type: 'default',
            fields: [{
                title: '',
                value: '{{#vars.user.address}}{{vars.user.address.formatted_address}}{{/vars.user.address}}{{^vars.user.address}}not setted yet{{/vars.user.address}}',
                short: false,
            }],
            actions: [{
                name: 'global_list',
                text: 'edit address',
                value: 'edit address',
                type: 'button',
                style: 'primary',
                confirm: {
                    title: 'Are you sure?',
                    text: 'Do you realy want to edit address settings?',
                    ok_text: 'Yes',
                    dismiss_text: 'No',
                },
            }],
        }, {
            callback_id: '123',
            color: '#28b395',
            attachment_type: 'default',
            fields: [
                {
                    title: '',
                    value: '{{#vars.user.cron}}{{vars.user.cron.formatted}}{{/vars.user.cron}}{{^vars.user.cron}}not setted yet{{/vars.user.cron}}',
                    short: false,
                },
            ],
            actions: [
                {
                    name: 'global_list',
                    text: 'edit time',
                    value: 'edit time',
                    type: 'button',
                    style: 'primary',
                    confirm: {
                        title: 'Are you sure?',
                        text: 'Do you realy want to edit time settings?',
                        ok_text: 'Yes',
                        dismiss_text: 'No',
                    },
                },
            ],
        }, {
            callback_id: '123',
            color: '#28b395',
            attachment_type: 'default',
            fields: [
                {
                    title: '',
                    value: '{{#vars.user.is_active_journal}}enabled{{/vars.user.is_active_journal}}{{^vars.user.is_active_journal}}disabled{{/vars.user.is_active_journal}}',
                    short: false,
                },
            ],
            actions: [
                {
                    name: 'global_list',
                    text: '{{#vars.user.is_active_journal}}disable{{/vars.user.is_active_journal}}{{^vars.user.is_active_journal}}enable{{/vars.user.is_active_journal}}',
                    value: 'enable/disable',
                    type: 'button',
                    style: '{{#vars.user.is_active_journal}}danger{{/vars.user.is_active_journal}}{{^vars.user.is_active_journal}}primary{{/vars.user.is_active_journal}}',
                    confirm: {
                        title: 'Are you sure?',
                        text: 'Do you realy want to edit enable settings?',
                        ok_text: 'Yes',
                        dismiss_text: 'No',
                    },
                },
            ],
        }, {
            title: 'Quit settings',
            callback_id: '123',
            color: '#F35A00',
            attachment_type: 'default',
            actions: [
                {
                    name: 'global_list',
                    text: 'quit settings',
                    value: 'quit settings',
                    type: 'button',
                    style: 'danger',
                },
            ],
        }];
        return attachment;
    }

    public getTimeAttachment(day: boolean): ISlackAttachment[] {
        const attachment = {
            text: day ? 'Choose a day repeat option' : 'Choose a hour repeat option',
            color: '#28b395',
            attachment_type: 'default',
            callback_id: 'time_selection',
            actions: [{
                name: day ? 'day_list' : 'hour_list',
                text: 'Pick a option...',
                type: 'select',
                options: [],
            }],
        };
        if (!day) {
            for (let index = 0; index < 24; index++) {
                attachment.actions[0].options.push({
                    text: index < 10 ? '0' + index + ':00' : index + ':00',
                    value: index < 10 ? '0' + index + ':00' : index + ':00',
                });
            }
        } else {
            DAY_REPEAT.forEach((element) => {
                attachment.actions[0].options.push({
                    text: element,
                    value: element,
                });
            });
        }
        return [attachment];
    }

    public getCallbackBranch(bot: SlackBot) {
        return [{
            pattern: 'edit address',
            callback: (response, convo) => {
                convo.gotoThread('address_thread');
            },
        },
        {
            pattern: 'edit time',
            callback: (response, convo) => {
                convo.gotoThread('time_thread');
            },
        },
        {
            pattern: 'enable/disable',
            callback: (response, convo) => {
                convo.gotoThread('enable_thread');
            },
        },
        {
            pattern: 'quit settings',
            callback: (response, convo) => {
                convo.gotoThread('quit_thread');
            },
        }];
    }
}

const settingsService = new SettingsService();
export default settingsService;
