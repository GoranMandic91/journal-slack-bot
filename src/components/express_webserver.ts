const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
// tslint:disable-next-line:no-var-keyword
var debug = require('debug')('botkit:webserver');
const http = require('http');

module.exports = (controller) => {

    const webserver = express();
    webserver.use(cookieParser());
    webserver.use(bodyParser.json());
    webserver.use(bodyParser.urlencoded({ extended: true }));

    // import express middlewares that are present in /components/express_middleware
    // var normalizedPath = require('path').join(__dirname, 'express_middleware');
    // require('fs').readdirSync(normalizedPath).forEach(function(file) {
    // require('./express_middleware/' + file)(webserver, controller);
    // });

    webserver.use(express.static('public'));

    const server = http.createServer(webserver);

    server.listen(process.env.PORT || 3000, null, () => {

        console.log('Express webserver configured and listening at port - ' + process.env.PORT || 3000);
    });

    // import all the pre-defined routes that are present in /components/routes
    const normalizedPath = require('path').join(__dirname, 'routes');
    require('fs').readdirSync(normalizedPath).forEach((file) => {
        if (file.indexOf('js.map') === -1) {
            require('./routes/' + file)(webserver, controller);
        }
    });

    controller.webserver = webserver;
    controller.httpserver = server;

    return webserver;

};
