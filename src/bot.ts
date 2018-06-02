import { UsersConversation } from './conversations/UsersConversation';
import { JournalConversation } from './conversations/JournalConversation';
import { WeatherConversation } from './conversations/WeatherConversation';
import { NewsConversation } from './conversations/NewsConversation';

const env = require('node-env-file');
if (process.env.NODE_ENV !== 'production') {
  env('./.env');
}

if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  usage_tip();
}

const Botkit = require('botkit');
const debug = require('debug')('botkit:main');

const mongoStorage = require('botkit-storage-mongo')({ mongoUri: process.env.MONGODB_URI });

const botOptions = {
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  debug: true,
  scopes: ['bot'],
  storage: mongoStorage,
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
require(__dirname + '/components/onboarding.js')(controller);

const normalizedPath = require('path').join(__dirname, 'skills');
require('fs').readdirSync(normalizedPath).forEach((file) => {
  if (file.indexOf('js.map') === -1) {
    require('./skills/' + file)(controller);
  }
});

const newsConversation = new NewsConversation(controller);
const weatherConversation = new WeatherConversation(controller);
const journalConversation = new JournalConversation(controller);
const usersConversation = new UsersConversation(controller);

console.log('~~~~~~~~~~');
console.log('Journal Slack bot started!');

function usage_tip() {
  console.log('~~~~~~~~~~');
  console.log('Journal Slack Bot');
  console.log('Execute your bot application like this:');
  console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 node bot.js');
  console.log('Get Slack app credentials here: https://api.slack.com/apps');
  console.log('~~~~~~~~~~');
}
