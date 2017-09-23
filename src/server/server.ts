import * as secrets from './secrets';
import * as express from 'express';
import passport from './passport';
import routes from './router';
import * as socketio from 'socket.io';
import { Server } from 'http';
import * as Session from 'express-session';

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

const currentSpeaker = {
  firstName: 'Brian',
  lastName: 'Terlson',
  organization: 'Microsoft',
  topic: 'Awesomeness'
};

const queuedSpeakers = [
  {
    firstName: 'Daniel',
    lastName: 'Rosenwasser',
    organization: 'Microsoft',
    topic: 'What is awesome?'
  },
  { firstName: 'Yehuda', lastName: 'Katz', organization: 'Tilde', topic: 'Hello' },
  { firstName: 'David', lastName: 'Herman', organization: 'LinkedIn', topic: 'This is a topic' }
].map((speaker, id) => ({ ...speaker, id }));

io.use(function(socket, next) {
  var req = socket.handshake;
  var res = {};
  console.log(socket.handshake);
  debugger;
  session(req as any, res as any, next);
});

io.on('connection', function(socket) {
  if (!socket.handshake.session || !socket.handshake.session.passport) {
    // not logged in I guess? Or session not found?
    socket.disconnect();
    return;
  }
  socket.emit('state', { currentSpeaker, queuedSpeakers });
  socket.on('newTopic', function(data: any) {});
});

export default app;
