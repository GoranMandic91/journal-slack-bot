import { SlackController } from 'botkit';
import { ISlackUser } from './../models/Slack';
import { ISlackTeam, ISlackBot } from '../models/Slack';
import * as debug from 'debug';
debug('botkit:user_registration');

export class AppRegistration {

    private controller: any;

    constructor(controller: any) {
        this.controller = controller;
        this.configureOAuthSuccess();
    }

    public configureOAuthSuccess() {
        /* Handle event caused by a user logging in with oauth */
        this.controller.on('oauth:success', (payload: ISlackBot) => {

            debug('Got a successful login!', payload);
            if (!payload.identity.team_id) {
                debug('Error: received an oauth response without a team id', payload);
            }
            this.controller.storage.teams.get(payload.identity.team_id, (err, team: ISlackTeam) => {
                if (err) {
                    debug('Error: could not load team from storage system:', payload.identity.team_id, err);
                }

                let newTeam = false;
                if (!team) {
                    team = {
                        id: payload.identity.team_id,
                        createdBy: payload.identity.user_id,
                        url: payload.identity.url,
                        name: payload.identity.team,
                    };
                    newTeam = true;
                }

                team.bot = {
                    token: payload.bot.bot_access_token,
                    user_id: payload.bot.bot_user_id,
                    createdBy: payload.identity.user_id,
                    app_token: payload.access_token,
                };

                const testbot: ISlackBot = this.controller.spawn(team.bot);

                testbot.api.auth.test({}, (err, bot_auth) => {
                    if (err) {
                        debug('Error: could not authenticate bot user', err);
                    } else {
                        team.bot.name = bot_auth.user;

                        // add in info that is expected by Botkit
                        testbot.identity = bot_auth;

                        testbot.identity.user_id = bot_auth.user_id;
                        testbot.identity.name = bot_auth.user;

                        testbot.team_info = team;

                        this.controller.storage.teams.save(team, (err, id) => {
                            if (err) {
                                debug('Error: could not save team record:', err);
                            } else {
                                if (newTeam) {
                                    this.createTeamAndUsers(testbot, team);
                                } else {
                                    this.updateTeamAndUsers(testbot, team);
                                }
                            }
                        });
                    }
                });
            });
        });
    }

    private createTeamAndUsers(bot: ISlackBot, team: ISlackTeam) {

        this.controller.storage.teams.save(team);

        bot.api.users.list({}, (err, response) => {
            if (err) {
                console.log(err);
            } else {
                response.members.forEach((member) => {
                    if (!member.is_bot && member.id !== 'USLACKBOT') {
                        member.tasks = [];
                        this.controller.storage.users.save(member);
                    }
                });
            }
        });

        //     debug('Team created:', team);
        //     // Trigger an event that will establish an RTM connection for this bot
        //     // this.controller.trigger('rtm:start', [bot.config]);

        // Trigger an event that will cause this team to receive onboarding messages
        this.controller.trigger('welcome', [bot, team]);
    }

    private updateTeamAndUsers(bot: ISlackBot, team: ISlackTeam) {

        this.controller.storage.teams.save(team);

        bot.api.users.list({}, (err, response) => {
            if (err) {
                console.log(err);
            } else {
                response.members.forEach((member) => {
                    if (!member.is_bot && member.id !== 'USLACKBOT') {
                        this.controller.storage.users.get(member.id, (err, user: ISlackUser) => {
                            if (!user) {
                                member.tasks = [];
                                this.controller.storage.users.save(member);
                            }
                        });
                    }
                });
            }
        });

        //     debug('Team updated:', team);
        //     // Trigger an event that will establish an RTM connection for this bot
        //     // this.controller.trigger('rtm:start', [bot]);

        // Trigger an event that will cause this team to receive onboarding messages
        this.controller.trigger('welcome', [bot, team]);

    }
}
