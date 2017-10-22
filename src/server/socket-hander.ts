import Meeting from '../shared/Meeting';
import Speaker from '../shared/Speaker';
import AgendaItem from '../shared/AgendaItem';
import User, { getByUsername } from './User';
import GitHubAuthenticatedUser from '../shared/GitHubAuthenticatedUser';
import * as socketio from 'socket.io';
import { isChair } from './User';
import * as Message from '../shared/Messages';
import { updateMeeting, getMeeting, getMeetingsCollection } from './db';
import { TopicTypes } from '../shared/Speaker';
import gha from './ghapi';
const DOCUMENT_ID = '9db4a2cb-2574-4480-ac15-4eba403f4bff';
const PRIORITIES: Speaker['type'][] = ['poo', 'question', 'reply', 'topic'];
import * as uuid from 'uuid';
import axios from 'axios';

let socks = new Set<Message.ServerSocket>();

export default async function connection(socket: Message.ServerSocket) {
  if (!(socket.handshake as any).session || !(socket.handshake as any).session.passport) {
    // not logged in I guess? Or session not found?
    console.log('disconnecting due to bad session');
    socket.disconnect();
    return;
  }

  const meetingId = socket.handshake.query.id;
  if (!meetingId) {
    console.log('disconnecting socket due to bad meeting id');
    socket.disconnect();
    return;
  }

  socks.add(socket);
  let githubUser: GitHubAuthenticatedUser = (socket.handshake as any).session.passport.user;
  let ghapi = gha(githubUser.accessToken);

  let user: User = {
    name: githubUser.name,
    organization: githubUser.organization,
    ghid: githubUser.ghid,
    ghUsername: githubUser.ghUsername
  };

  const meeting = await getMeeting(meetingId);

  // send meeting state
  socket.emit(Message.Type.state, {
    currentSpeaker: meeting.currentSpeaker,
    queuedSpeakers: meeting.queuedSpeakers,
    agenda: meeting.agenda,
    chairs: meeting.chairs,
    user: user
  });

  socket.on(Message.Type.newTopic, newTopic);
  socket.on(Message.Type.nextSpeaker, nextSpeaker);
  socket.on(Message.Type.disconnect, disconnect);
  socket.on(Message.Type.newAgendaItemRequest, newAgendaItem);
  socket.on(Message.Type.reorderAgendaItemRequest, reorderAgendaItem);
  socket.on(Message.Type.deleteAgendaItemRequest, deleteAgendaItem);

  async function deleteAgendaItem(message: Message.DeleteAgendaItem) {
    const meeting = await getMeeting(meetingId);
    if (!isChair(user, meeting)) {
      socket.emit(Message.Type.Response, { status: 403 });
      return;
    }
    meeting.agenda.splice(message.index, 1);
    await updateMeeting(meeting);

    socket.emit(Message.Type.Response, { status: 200 });
    emitAll(Message.Type.deleteAgendaItem, message);
  }

  async function reorderAgendaItem(message: Message.ReorderAgendaItemRequest) {
    const meeting = await getMeeting(meetingId);
    if (!isChair(user, meeting)) {
      socket.emit(Message.Type.Response, { status: 403 });
      return;
    }

    meeting.agenda.splice(message.newIndex, 0, meeting.agenda.splice(message.oldIndex, 1)[0]);
    await updateMeeting(meeting);

    socket.emit(Message.Type.Response, { status: 200 });
    emitAll(Message.Type.reorderAgendaItem, message);
  }

  async function newAgendaItem(message: Message.NewAgendaItemRequest) {
    const meeting = await getMeeting(meetingId);
    if (!isChair(user, meeting)) {
      socket.emit(Message.Type.Response, { status: 403 });
      return;
    }
    console.log('np np');
    // populate the agenda item owner's user data from github if necessary
    let owner;

    try {
      owner = await getByUsername(message.ghUsername, githubUser.accessToken);
    } catch (e) {
      socket.emit(Message.Type.Response, { status: 400, message: 'Github username not found' });
      return;
    }

    let agendaItem: AgendaItem = {
      id: uuid(),
      name: message.name,
      timebox: Number(message.timebox),
      user: owner
    };

    meeting.agenda.push(agendaItem);
    await updateMeeting(meeting);

    socket.emit(Message.Type.Response, { status: 200 });
    emitAll(Message.Type.newAgendaItem, agendaItem);
  }

  async function newTopic(message: Message.NewTopic) {
    const speaker: Speaker = {
      user,
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

    if (user.ghid && meeting.currentSpeaker.user.ghid !== user.ghid && !isChair(user.ghid)) {
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

function emitAll(type: Message.Type, ...args: any[]) {
  socks.forEach(s => {
    // sad cast is sad
    s.emit(type, ...args);
  });
}
