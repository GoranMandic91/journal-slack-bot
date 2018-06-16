import { ISlackAttachment, ISlackUser } from './../models/Slack';
import { DAY_REPEAT } from '../conversations/SettingsConversation';
import { SlackBot } from 'botkit';

export class SettingsService {

    public getGlobalAttachment(user: ISlackUser): ISlackAttachment[] {
        const enabled = user && user.cron && user.cron.pattern.length && user.address && user.address.address;
        const attachment = [{
            callback_id: '123',
            color: '#28b395',
            attachment_type: 'default',
            fields: [{
                title: '',
                value: user && user.address && user.address.address ? '{{vars.user.address.address}}' : 'not setted yet',
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
                    value: user && user.cron && user.cron.pattern && user.cron.pattern.length ? '{{vars.user.cron.formatted}}' : 'not setted yet',
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
                    value: '{{#vars.user.active_journal}}enabled{{/vars.user.active_journal}}{{^vars.user.active_journal}}disabled{{/vars.user.active_journal}}',
                    short: false,
                },
            ],
            actions: [
                {
                    name: 'global_list',
                    text: '{{#vars.user.active_journal}}disable{{/vars.user.active_journal}}{{^vars.user.active_journal}}enable{{/vars.user.active_journal}}',
                    value: 'enable/disable',
                    type: 'button',
                    style: '{{#vars.user.active_journal}}danger{{/vars.user.active_journal}}{{^vars.user.active_journal}}primary{{/vars.user.active_journal}}',
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
