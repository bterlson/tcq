import * as secrets from './secrets';
// important that this block come very early as appinsights shims many things
import client from './telemetry';

import log from './logger';
import * as express from 'express';
import passport from './passport';
import routes from './router';
import * as socketio from 'socket.io';
import { Server } from 'http';
import * as Session from 'express-session';
import Speaker from '../shared/Speaker';
import socketHandler from './socket-hander';
import DocumentDBSession = require('documentdb-session');
import * as dbConstants from './db';
import * as bodyParser from 'body-parser';

const app = express();
const server = new Server(app);
const io = socketio(server, { perMessageDeflate: false });
const port = process.env.PORT || 3000;
log.info('Starting server');
server.listen(port, function() {
  log.info('Application started and listening on port ' + port);
});

const DocumentDBStore = DocumentDBSession(Session);

const sessionStore = new DocumentDBStore({
  host: dbConstants.HOST,
  database: dbConstants.DATABASE_ID,
  collection: dbConstants.SESSION_COLLECTION_ID,
  key: secrets.CDB_SECRET
});

const session = Session({
  secret: secrets.SESSION_SECRET,
  store: sessionStore,
  resave: true,
  saveUninitialized: true
});

app.use(function(req, res, next) {
  client.trackNodeHttpRequest({ request: req, response: res });
  next();
});
app.use(require('express-bunyan-logger')());
app.use(bodyParser.json());
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);
app.use(express.static('dist/client/'));

io.use(function(socket, next) {
  var req = socket.handshake;
  var res = {};
  session(req as any, res as any, next);
});
io.on('connection', socketHandler);

export default app;
