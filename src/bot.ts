import { Onboarding } from './components/Onboarding';
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
import * as Botkit from 'botkit';
import * as mongoDB from 'botkit-storage-mongo';
import * as env from 'node-env-file';
import * as debug from 'debug';
debug('botkit:main');

if (process.env.NODE_ENV !== 'production') {
  env('./.env');
}

if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  usage_tip();
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
const webserver = require(__dirname + '/components/express_webserver.js')(controller);

webserver.get('/', (req, res) => {
  res.render('index', {
    domain: req.get('host'),
    protocol: req.protocol,
    layout: 'index.html',
  });
});
// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + '/components/user_registration.js')(controller);

// Send an onboarding message when a new team joins
const onboarding = new Onboarding(controller);

// const normalizedPath = require('path').join(__dirname, 'skills');
// require('fs').readdirSync(normalizedPath).forEach((file) => {
//   if (file.indexOf('js.map') === -1) {
//     require('./skills/' + file)(controller);
//   }
// });

const newsConversation = new NewsConversation(controller);
const weatherConversation = new WeatherConversation(controller);
const journalConversation = new JournalConversation(controller);
const usersConversation = new UsersConversation(controller);

const channelJoinSkill = new ChannelJoinSkill(controller);
const sampleConversationSkill = new SampleConversationSkill(controller);
const sampleTaskbotSkill = new SampleTaskbotSkill(controller);
const sampleEventsSkill = new SampleEventsSkill(controller);
const sampleHearsSkill = new SampleHearsSkill(controller);

const sampleMiddleware = new SampleMiddleware(controller);

console.log('Journal Slack bot started!');

function usage_tip() {
  console.log('~~~~~~~~~~');
  console.log('Journal Slack Bot');
  console.log('Execute your bot application like this:');
  console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 node bot.js');
  console.log('Get Slack app credentials here: https://api.slack.com/apps');
  console.log('~~~~~~~~~~');
}
