import Meeting from '../shared/Meeting';
import Speaker from '../shared/Speaker';
import User from '../shared/User';
import GitHubAuthenticatedUser from '../shared/GitHubAuthenticatedUser';
import * as socketio from 'socket.io';
import { isChair } from './chairs';
import * as docdb from 'documentdb-typescript';
import { DATABASE_ID, COLLECTION_ID, HOST } from './db';
import { CDB_SECRET } from './secrets';
import { DocumentResource } from 'documentdb-typescript/typings/_DocumentDB';

const DOCUMENT_ID = '9db4a2cb-2574-4480-ac15-4eba403f4bff';

/*
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
    ghid: '4' // really...
  },
  {
    name: 'David Herman',
    organization: 'LinkedIn',
    topic: 'This is a topic',
    type: 'topic',
    ghid: '307871'
  }
];
*/
let socks = new Set<SocketIO.Socket>();

export default async function connection(socket: SocketIO.Socket) {
  const meetingPromise = getMeetingAsync(DOCUMENT_ID);
  if (!(socket.handshake as any).session || !(socket.handshake as any).session.passport) {
    // not logged in I guess? Or session not found?
    socket.disconnect();
    return;
  }
  socks.add(socket);
  let githubUser: GitHubAuthenticatedUser = (socket.handshake as any).session.passport.user;
  let user: User = {
    name: githubUser.name,
    organization: githubUser.company,
    ghid: githubUser.ghid
  };

  const meeting = await meetingPromise;
  socket.emit('state', {
    currentSpeaker: meeting.currentSpeaker,
    queuedSpeakers: meeting.queuedSpeakers
  });
  socket.on('newTopic', newTopic);
  socket.on('poo', poo);
  socket.on('question', question);
  socket.on('reply', reply);
  socket.on('nextSpeaker', nextSpeaker);
  socket.on('disconnect', disconnect);

  async function newTopic(data: { topic: string }) {
    const speaker: Speaker = {
      ...user,
      topic: data.topic,
      type: 'topic'
    };
    await enqueueSpeaker(speaker);
  }

  async function poo() {
    const speaker: Speaker = {
      ...user,
      topic: '*pounds gavel* Order! Order! Order I say!',
      type: 'poo'
    };
    await enqueueSpeaker(speaker);
  }

  async function question() {
    const meeting = await getMeetingAsync(DOCUMENT_ID);
    const currentTopic = meeting.currentSpeaker ? meeting.currentSpeaker.topic : '';
    const speaker: Speaker = {
      ...user,
      topic: currentTopic,
      type: 'question'
    };
    await enqueueSpeaker(speaker);
  }

  async function reply(data: any) {
    const meeting = await getMeetingAsync(DOCUMENT_ID);
    let currentTopic = meeting.currentSpeaker ? meeting.currentSpeaker.topic : '';
    const speaker: Speaker = {
      ...user,
      topic: currentTopic,
      type: 'reply'
    };
    await enqueueSpeaker(speaker);
  }

  async function nextSpeaker() {
    const collection = await getCollectionAsync();
    const meeting = await getMeetingAsync(DOCUMENT_ID, collection);
    if (!meeting.currentSpeaker) return;

    if (meeting.currentSpeaker.ghid !== user.ghid && !isChair(user.ghid)) {
      // unauthorized
      return;
    }

    if (meeting.queuedSpeakers.length === 0) {
      meeting.currentSpeaker = null;
    } else {
      meeting.currentSpeaker = meeting.queuedSpeakers.shift()!;
    }
    await collection.storeDocumentAsync(meeting, docdb.StoreMode.UpdateOnly);
    emitAll('nextSpeaker', meeting.currentSpeaker);
  }

  function disconnect() {
    socks.delete(socket);
  }
}

function emitAll(name: string | symbol, ...args: any[]) {
  socks.forEach(s => {
    s.emit(name, ...args);
  });
}

let priorities: Speaker['type'][] = ['poo', 'question', 'reply', 'topic'];

async function enqueueSpeaker(speaker: Speaker, meeting?: Meeting & DocumentResource) {
  const collection = await getCollectionAsync();
  meeting = meeting || (await getMeetingAsync(DOCUMENT_ID, collection));
  if (!meeting) {
    console.log('Meeting not found!');
    return;
  }

  const { queuedSpeakers } = meeting;
  let index = queuedSpeakers.findIndex(function(queuedSpeaker) {
    return priorities.indexOf(queuedSpeaker.type) > priorities.indexOf(speaker.type);
  });

  if (index === -1) {
    index = queuedSpeakers.length;
  }

  if (!meeting.currentSpeaker && queuedSpeakers.length === 0) {
    emitAll('nextSpeaker', speaker);
    meeting.currentSpeaker = speaker;
  } else {
    queuedSpeakers.splice(index, 0, speaker);
    emitAll('newSpeaker', {
      position: index,
      speaker: speaker
    });
  }
  await collection.storeDocumentAsync(meeting, docdb.StoreMode.UpdateOnly);
}

async function getMeetingAsync(meetingId: string, collection?: docdb.Collection) {
  if (!collection) collection = await getCollectionAsync();
  let meeting: Meeting & DocumentResource;
  try {
    meeting = (await collection.findDocumentAsync(meetingId)) as Meeting & DocumentResource;
  } catch {
    // Note, not sure if this can still throw?
    meeting = await collection.storeDocumentAsync({
      currentSpeaker: null,
      queuedSpeakers: [],
      id: DOCUMENT_ID
    });
  }
  return meeting;
}

async function getCollectionAsync() {
  return new docdb.Collection(COLLECTION_ID, DATABASE_ID, HOST, CDB_SECRET).openAsync();
}
