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

const session = Session({
  secret: secrets.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
});

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('dist/client/'));
app.use(routes);

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
  // stack overflow assures me this is how to inject session
  session(socket.handshake as any, {} as any, next);
});

io.on('connection', function(socket) {
  // and yes, this object is populated.... however it doesn't seem to contain anything useful.
  console.log(JSON.stringify(socket.handshake.session));
  console.log(socket.request.headers);
  console.log(socket.handshake.session.accessToken);
  socket.emit('state', { currentSpeaker, queuedSpeakers });
  socket.on('newTopic', function(data: any) {});
});

export default app;
