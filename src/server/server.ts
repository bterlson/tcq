import * as secrets from './secrets';
import * as express from 'express';
import passport from './passport';
import routes from './router';
import * as socketio from 'socket.io';
import { Server } from 'http';
import * as Session from 'express-session';
import Speaker from '../shared/Speaker';
import socketHandler from './socket-hander';

const app = express();
const server = new Server(app);
const io = socketio(server);
server.listen(3000);

const sessionStore = new Session.MemoryStore();

const session = Session({
  secret: secrets.SESSION_SECRET,
  store: sessionStore,
  resave: true,
  saveUninitialized: true
});

app.use(require('body-parser').urlencoded({ extended: true }));
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
