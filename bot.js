
var env = require('node-env-file');
if (process.env.NODE_ENV !== 'production') {
  env(__dirname + '/.env');
}


if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  usage_tip();
}

var Botkit = require('botkit');
var debug = require('debug')('botkit:main');

var bot_options = {
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  debug: true,
  scopes: ['bot'],
};


// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGODB_URI) {
  var mongoStorage = require('botkit-storage-mongo')({ mongoUri: process.env.MONGODB_URI });
  bot_options.storage = mongoStorage;
} else {
  bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.slackbot(bot_options);

controller.startTicking();

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/dist/components/express_webserver.js')(controller);

webserver.get('/', (req, res) => {
  res.render('index', {
    domain: req.get('host'),
    protocol: req.protocol,
    layout: 'index.html'
  });
})
// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + '/dist/components/user_registration.js')(controller);

// Send an onboarding message when a new team joins
require(__dirname + '/dist/components/onboarding.js')(controller);


var normalizedPath = require("path").join(__dirname, "dist/skills");
require("fs").readdirSync(normalizedPath).forEach((file) => {
  if (file.indexOf("js.map") === -1) {
    require("./dist/skills/" + file)(controller);
  }
});

console.log('~~~~~~~~~~');
console.log('Journal Slack bot started!');

function usage_tip() {
  console.log('~~~~~~~~~~');
  console.log('Journal Slack Bot');
  console.log('Execute your bot application like this:');
  console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 node bot.js');
  console.log('Get Slack app credentials here: https://api.slack.com/apps')
  console.log('~~~~~~~~~~');
}
