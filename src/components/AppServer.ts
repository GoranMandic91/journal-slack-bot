import { OAuthRoute } from './routes/OAuthRoute';
import { IncomingWebhooksRoute } from './routes/IncomingWebhooksRoute';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as querystring from 'querystring';
import * as http from 'http';
import * as debug from 'debug';
debug('botkit:webserver');

export class AppServer {

    public controller: any;
    public webserver: any;

    constructor(controller: any) {
        this.controller = controller;
        this.webserver = express();
        this.webserver.use(cookieParser());
        this.webserver.use(bodyParser.json());
        this.webserver.use(bodyParser.urlencoded({ extended: true }));
        this.webserver.use(express.static('public'));
        this.configure();
    }

    public configure() {

        const server = http.createServer(this.webserver);

        server.listen(process.env.PORT || 3000, null, () => {
            console.log('Express webserver configured and listening at port - ' + process.env.PORT || 3000);
        });

        const iwr = new IncomingWebhooksRoute(this.webserver, this.controller);
        const oar = new OAuthRoute(this.webserver, this.controller);

        this.controller.webserver = this.webserver;
        this.controller.httpserver = server;

    }
    public home() {
        this.webserver.get('/', (req, res) => {
            res.render('index', {
                domain: req.get('host'),
                protocol: req.protocol,
                layout: 'index.html',
            });
        });
    }
}
