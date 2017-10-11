import Meeting from '../shared/Meeting';
import Speaker from '../shared/Speaker';
import User from '../shared/User';
import GitHubAuthenticatedUser from '../shared/GitHubAuthenticatedUser';
import * as socketio from 'socket.io';
import { isChair } from './chairs';

import { updateMeeting, getMeeting, getMeetingsCollection } from './db';
import { TopicTypes } from '../shared/Speaker';

const DOCUMENT_ID = '9db4a2cb-2574-4480-ac15-4eba403f4bff';
const PRIORITIES: Speaker['type'][] = ['poo', 'question', 'reply', 'topic'];

let socks = new Set<SocketIO.Socket>();

export default async function connection(socket: SocketIO.Socket) {
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

  const meeting = await getMeeting(DOCUMENT_ID);

  socket.emit('state', {
    currentSpeaker: meeting.currentSpeaker,
    queuedSpeakers: meeting.queuedSpeakers
  });
  socket.on('newTopic', newTopic);
  socket.on('nextSpeaker', nextSpeaker);
  socket.on('disconnect', disconnect);

  async function newTopic(data: { topic: string; type: TopicTypes; uuid: string }) {
    const speaker: Speaker = {
      ...user,
      ...data
    };

    await enqueueSpeaker(speaker, DOCUMENT_ID);
  }

  async function enqueueSpeaker(speaker: Speaker, meetingId: string) {
    const meeting = await getMeeting(meetingId);

    const { currentSpeaker, queuedSpeakers } = meeting;

    const currentSpeakerIds = new Set<string>();
    if (currentSpeaker) {
      currentSpeakerIds.add(currentSpeaker.uuid);
    }

    queuedSpeakers.forEach(s => currentSpeakerIds.add(s.uuid));

    let index = queuedSpeakers.findIndex(function(queuedSpeaker) {
      return PRIORITIES.indexOf(queuedSpeaker.type) > PRIORITIES.indexOf(speaker.type);
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

    await updateMeeting(meeting);
  }

  async function nextSpeaker() {}

  function disconnect() {
    socks.delete(socket);
  }
}

function emitAll(name: string | symbol, ...args: any[]) {
  socks.forEach(s => {
    s.emit(name, ...args);
  });
}
