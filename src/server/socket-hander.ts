import Meeting from '../shared/Meeting';
import Speaker from '../shared/Speaker';
import User from '../shared/User';
import GitHubAuthenticatedUser from '../shared/GitHubAuthenticatedUser';
import * as socketio from 'socket.io';
import { isChair } from './chairs';
import * as Message from '../shared/Messages';
import { updateMeeting, getMeeting, getMeetingsCollection } from './db';
import { TopicTypes } from '../shared/Speaker';

const DOCUMENT_ID = '9db4a2cb-2574-4480-ac15-4eba403f4bff';
const PRIORITIES: Speaker['type'][] = ['poo', 'question', 'reply', 'topic'];

let socks = new Set<Message.ServerSocket>();

export default async function connection(socket: Message.ServerSocket) {
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

  socket.emit(Message.Type.state, {
    currentSpeaker: meeting.currentSpeaker,
    queuedSpeakers: meeting.queuedSpeakers,
    agenda: []
  });
  socket.on(Message.Type.newTopic, newTopic);
  socket.on(Message.Type.nextSpeaker, nextSpeaker);
  socket.on(Message.Type.disconnect, disconnect);

  async function newTopic(message: Message.NewTopic) {
    const speaker: Speaker = {
      ...user,
      ...message
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
      emitAll(Message.Type.newCurrentSpeaker, speaker);
      meeting.currentSpeaker = speaker;
    } else {
      queuedSpeakers.splice(index, 0, speaker);
      emitAll(Message.Type.newQueuedSpeaker, {
        position: index,
        speaker: speaker
      });
    }

    await updateMeeting(meeting);
  }

  async function nextSpeaker() {
    const meeting = await getMeeting(DOCUMENT_ID);
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
    await updateMeeting(meeting);
    emitAll(Message.Type.newCurrentSpeaker, meeting.currentSpeaker);
  }

  function disconnect() {
    socks.delete(socket);
  }
}
function emitAll(type: Message.Type.newQueuedSpeaker, message: Message.NewQueuedSpeaker): void;
function emitAll(type: Message.Type.newCurrentSpeaker, message: Message.NewCurrentSpeaker): void;
function emitAll(type: any, ...args: any[]) {
  socks.forEach(s => {
    // sad cast is sad
    s.emit(type, ...args);
  });
}
