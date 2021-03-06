import { CronConversation } from './conversations/CronConversation';
import { AppRegistration } from './components/AppRegistration';
import { AppServer } from './components/AppServer';
import { InteractiveMessageMiddleware } from './middlewares/InteractiveMessageMiddleware';
import { WelcomeAboardConversation } from './conversations/WelcomeAboardConversation';
import { DebugMiddleware } from './middlewares/DebugMiddleware';
import { WeatherConversation } from './conversations/WeatherConversation';
import { NewsConversation } from './conversations/NewsConversation';
import { UserJoinConversation } from './conversations/UserJoinConversation';
import { DefaultConversation } from './conversations/DefaultConversation';
import { HelpConversation } from './conversations/HelpConversation';
import { GreetingConversation } from './conversations/GreetingConversation';
import { PartingConversation } from './conversations/PartingConversation';
import { GratitudeConversation } from './conversations/GratitudeConversation';
import { SettingsConversation } from './conversations/SettingsConversation';
import { WitMiddleware } from './middlewares/WitMiddleware';
import * as Botkit from 'botkit';
import * as mongoDB from 'botkit-storage-mongo';
import * as env from 'node-env-file';
import * as debug from 'debug';
debug('botkit:main');

if (process.env.NODE_ENV !== 'production') {
  env('./.env');
}

if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  debug('~~~~~~~~~~');
  debug('Journal Slack Bot');
  debug('Execute your bot application like this:');
  debug('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 node bot.js');
  debug('Get Slack app credentials here: https://api.slack.com/apps');
  debug('~~~~~~~~~~');
}

const botOptions = {
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  debug: process.env.NODE_ENV !== 'production' ? true : false,
  scopes: ['bot'],
  storage: mongoDB({ mongoUri: process.env.MONGODB_URI }),
};

// Create the Botkit controller, which controls all instances of the bot.
const controller = Botkit.slackbot(botOptions);
controller.startTicking();

// Set up an Express-powered webserver to expose oauth and webhook endpoints
const server = new AppServer(controller);
server.home();

const appRegistration = new AppRegistration(controller);

// uncomment next line if you want to use RTM
// const rtmManager = new RtmManager(controller);

// middlewares
const witMiddleware = new WitMiddleware(controller);
const debugMiddleware = new DebugMiddleware(controller);
const interactiveMessageMiddleware = new InteractiveMessageMiddleware(controller);

const welcomeAboardConversation = new WelcomeAboardConversation(controller);
const userJoinConversation = new UserJoinConversation(controller);
const helpConversation = new HelpConversation(controller);

const newsConversation = new NewsConversation(controller);
const weatherConversation = new WeatherConversation(controller);
const greetingConversation = new GreetingConversation(controller);
const partingConversation = new PartingConversation(controller);
const gratitudeConversation = new GratitudeConversation(controller);

const settingsConversation = new SettingsConversation(controller);
const cronConversation = new CronConversation(controller);

const defaultConversation = new DefaultConversation(controller);
console.log('Journal Slack bot started!');
