import Speaker from '../shared/speaker';
import User from '../shared/user';
import * as socketio from 'socket.io';
import { isChair } from './chairs';

let currentSpeaker: Speaker | null = {
  name: 'Brian Terlson',
  organization: 'Microsoft',
  topic: 'The definition for the production FunctionDeclaration is incorrect',
  type: 'topic',
  ghid: '11236'
};

const queuedSpeakers: Speaker[] = [
  {
    name: 'Brian Terlson',
    organization: 'Microsoft',
    topic: 'What is awesome?',
    type: 'poo',
    ghid: '11236'
  },
  {
    name: 'Ron Buckton',
    organization: 'Microsoft',
    topic: 'What are we talking about?',
    type: 'question',
    ghid: '3902892'
  },
  {
    name: 'Yehuda Katz',
    organization: 'Tilde',
    topic: 'Hello',
    type: 'reply',
    ghid: '4' /* really... */
  },
  {
    name: 'David Herman',
    organization: 'LinkedIn',
    topic: 'This is a topic',
    type: 'topic',
    ghid: '307871'
  }
];

let socks = new Set<SocketIO.Socket>();

export default function connection(socket: SocketIO.Socket) {
  socks.add(socket);
  if (!(socket.handshake as any).session || !(socket.handshake as any).session.passport) {
    // not logged in I guess? Or session not found?
    socket.disconnect();
    return;
  }
  let user: User = (socket.handshake as any).session.passport.user;

  socket.emit('state', { currentSpeaker, queuedSpeakers });
  socket.on('newTopic', function(data: any) {
    const speaker: Speaker = {
      name: user.name,
      organization: user.company,
      topic: data.topic,
      type: 'topic',
      ghid: user.ghid
    };

    enqueueSpeaker(speaker);
  });

  socket.on('poo', function() {
    const speaker: Speaker = {
      name: user.name,
      organization: user.company,
      topic: '*pounds gavel* Order! Order! Order I say!',
      type: 'poo',
      ghid: user.ghid
    };

    enqueueSpeaker(speaker);
  });

  socket.on('question', function() {
    let currentTopic = currentSpeaker ? currentSpeaker.topic : '';

    const speaker: Speaker = {
      name: user.name,
      organization: user.company,
      topic: currentTopic,
      type: 'question',
      ghid: user.ghid
    };

    enqueueSpeaker(speaker);
  });

  socket.on('reply', function(data: any) {
    let currentTopic = currentSpeaker ? currentSpeaker.topic : '';

    const speaker: Speaker = {
      name: user.name,
      organization: user.company,
      topic: currentTopic,
      type: 'reply',
      ghid: user.ghid
    };

    enqueueSpeaker(speaker);
  });

  socket.on('nextSpeaker', function() {
    if (!currentSpeaker) return;

    if (!(currentSpeaker.ghid === user.ghid || isChair(user.ghid))) {
      // unauthorized
      return;
    }

    if (queuedSpeakers.length === 0) {
      currentSpeaker = null;
      emitAll('nextSpeaker', null);
      return;
    }

    currentSpeaker = queuedSpeakers.shift()!;
    emitAll('nextSpeaker', currentSpeaker);
  });

  socket.on('disconnect', function() {
    socks.delete(socket);
  });
}

function emitAll(name: string | symbol, ...args: any[]) {
  socks.forEach(s => {
    s.emit(name, ...args);
  });
}
let priorities: typeof currentSpeaker.type[] = ['poo', 'question', 'reply', 'topic'];

function enqueueSpeaker(speaker: Speaker) {
  let index = queuedSpeakers.findIndex(function(v) {
    return priorities.indexOf(v.type) > priorities.indexOf(speaker.type);
  });

  if (index === -1) {
    index = queuedSpeakers.length;
  }

  if (!currentSpeaker && queuedSpeakers.length === 0) {
    emitAll('nextSpeaker', speaker);
    currentSpeaker = speaker;
  } else {
    queuedSpeakers.splice(index, 0, speaker);
    emitAll('newSpeaker', {
      position: index,
      speaker: speaker
    });
  }
}
