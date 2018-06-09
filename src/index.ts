import { AppRegistration } from './components/AppRegistration';
import { RtmManager } from './components/RtmManager';
import { AppServer } from './components/AppServer';
import { InteractiveMessageSkill } from './skills/InteractiveMessageSkill';
import { WelcomeAboard } from './components/WelcomeAboard';
import { SampleMiddleware } from './middlewares/SampleMiddleware';
import { SampleHearsSkill } from './skills/SampleHearsSkill';
import { ChannelJoinSkill } from './skills/ChannelJoinSkill';
import { UsersConversation } from './conversations/UsersConversation';
import { JournalConversation } from './conversations/JournalConversation';
import { WeatherConversation } from './conversations/WeatherConversation';
import { NewsConversation } from './conversations/NewsConversation';
import { SampleConversationSkill } from './skills/SampleConversationSkill';
import { SampleTaskbotSkill } from './skills/SampleTaskbotSkill';
import { SampleEventsSkill } from './skills/SampleEventsSkill';
import { DefaultSkill } from './skills/DefaultSkill';
import * as Botkit from 'botkit';
import * as mongoDB from 'botkit-storage-mongo';
import * as env from 'node-env-file';
import * as debug from 'debug';
import { HelpSkill } from './skills/HelpSkill';
import { GreetingConversation } from './conversations/GreetingConversation';
import { PartingConversation } from './conversations/PartingConversation';
debug('botkit:main');

if (process.env.NODE_ENV !== 'production') {
  env('./.env');
}

if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  console.log('~~~~~~~~~~');
  console.log('Journal Slack Bot');
  console.log('Execute your bot application like this:');
  console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 node bot.js');
  console.log('Get Slack app credentials here: https://api.slack.com/apps');
  console.log('~~~~~~~~~~');
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

// Send an onboarding message when a new team joins
const welcomeAboard = new WelcomeAboard(controller);

const journalConversation = new JournalConversation(controller);
const newsConversation = new NewsConversation(controller);
const usersConversation = new UsersConversation(controller);
const weatherConversation = new WeatherConversation(controller);
const greetingConversation = new GreetingConversation(controller);
const partingConversation = new PartingConversation(controller);
const sampleMiddleware = new SampleMiddleware(controller);

const channelJoinSkill = new ChannelJoinSkill(controller);
const interactiveMessageSkill = new InteractiveMessageSkill(controller);
const sampleConversationSkill = new SampleConversationSkill(controller);
const sampleEventsSkill = new SampleEventsSkill(controller);
const sampleHearsSkill = new SampleHearsSkill(controller);
const sampleTaskbotSkill = new SampleTaskbotSkill(controller);
const helpSkill = new HelpSkill(controller);
const defaultSkill = new DefaultSkill(controller);

console.log('Journal Slack bot started!');
