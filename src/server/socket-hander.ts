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
const PRIORITIES: Speaker['type'][] = ['poo', 'question', 'reply', 'topic'];
import * as uuid from 'uuid';
import axios from 'axios';
import client from './telemetry';
import * as pLimit from 'p-limit';

let socks = new Set<Message.ServerSocket>();

// not ideal, but necessary to prevent interleaving updates
const waitTurn = pLimit(1);

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

  // way too many type annotations
  let state: Message.State = Object.keys(meeting)
    .filter(k => k[0] !== '_')
    .reduce((s, k) => {
      (s as any)[k] = (meeting as any)[k];
      return s;
    }, {}) as any;
  state.user = user;

  socket.emit(Message.Type.state, state);

  socket.on(Message.Type.newQueuedSpeakerRequest, instrumentSocketFn(newTopic));
  socket.on(Message.Type.nextSpeaker, instrumentSocketFn(nextSpeaker));
  socket.on(Message.Type.disconnect, disconnect);
  socket.on(Message.Type.newAgendaItemRequest, instrumentSocketFn(newAgendaItem));
  socket.on(Message.Type.reorderAgendaItemRequest, instrumentSocketFn(reorderAgendaItem));
  socket.on(Message.Type.deleteAgendaItemRequest, instrumentSocketFn(deleteAgendaItem));
  socket.on(Message.Type.nextAgendaItemRequest, instrumentSocketFn(nextAgendaItem));

  async function nextAgendaItem(respond: Responder, message: Message.NextAgendaItemRequest) {
    const meeting = await getMeeting(meetingId);

    if (meeting.currentAgendaItem && meeting.currentAgendaItem.id !== message.currentItemId) {
      respond(403, { message: 'Agenda item out of sync' });
      return;
    }

    if (!meeting.currentAgendaItem) {
      // waiting for meeting to start, so kick it off.
      meeting.currentAgendaItem = meeting.agenda[0];
    } else {
      let id = meeting.currentAgendaItem.id;
      let currentIndex = meeting.agenda.findIndex(i => i.id === id);
      meeting.currentAgendaItem = meeting.agenda[currentIndex + 1];
    }

    meeting.currentSpeaker = {
      id: uuid(),
      user: meeting.currentAgendaItem.user,
      topic: 'Introducing: ' + meeting.currentAgendaItem.name,
      type: 'topic'
    };

    await updateMeeting(meeting);
    respond(200);
    emitAll(Message.Type.nextAgendaItem, meeting.currentAgendaItem);
    emitAll(Message.Type.newCurrentSpeaker, meeting.currentSpeaker);
  }

  async function deleteAgendaItem(respond: Responder, message: Message.DeleteAgendaItem) {
    const meeting = await getMeeting(meetingId);
    if (!isChair(user, meeting)) {
      respond(403);
      return;
    }
    meeting.agenda.splice(message.index, 1);
    await updateMeeting(meeting);

    respond(200);
    emitAll(Message.Type.deleteAgendaItem, message);
  }

  async function reorderAgendaItem(respond: Responder, message: Message.ReorderAgendaItemRequest) {
    const meeting = await getMeeting(meetingId);
    if (!isChair(user, meeting)) {
      respond(403);
      return;
    }

    meeting.agenda.splice(message.newIndex, 0, meeting.agenda.splice(message.oldIndex, 1)[0]);
    await updateMeeting(meeting);
    respond(200);
    emitAll(Message.Type.reorderAgendaItem, message);
  }

  async function newAgendaItem(respond: Responder, message: Message.NewAgendaItemRequest) {
    const meeting = await getMeeting(meetingId);
    if (!isChair(user, meeting)) {
      respond(403);
      return;
    }

    // populate the agenda item owner's user data from github if necessary
    let owner;

    try {
      owner = await getByUsername(message.ghUsername, githubUser.accessToken);
    } catch (e) {
      respond(400, { message: 'Github username not found' });
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
    client.trackEvent({ name: 'New Agenda Item' });
    emitAll(Message.Type.newAgendaItem, agendaItem);
    respond(200);
  }

  async function newTopic(respond: Responder, message: Message.NewQueuedSpeakerRequest) {
    const speaker: Speaker = {
      user,
      ...message
    };

    const meeting = await getMeeting(meetingId);

    const { currentSpeaker, queuedSpeakers } = meeting;

    let index = queuedSpeakers.findIndex(function(queuedSpeaker) {
      return PRIORITIES.indexOf(queuedSpeaker.type) > PRIORITIES.indexOf(speaker.type);
    });

    if (index === -1) {
      index = queuedSpeakers.length;
    }

    queuedSpeakers.splice(index, 0, speaker);

    await updateMeeting(meeting);
    emitAll(Message.Type.newQueuedSpeaker, {
      position: index,
      speaker: speaker
    });
    client.trackEvent({ name: 'New Speaker' });
    respond(200);
  }

  async function nextSpeaker(respond: Responder) {
    const meeting = await getMeeting(meetingId);
    if (
      user.ghid &&
      meeting.currentSpeaker &&
      meeting.currentSpeaker.user.ghid !== user.ghid &&
      !isChair(user, meeting)
    ) {
      // unauthorized
      respond(402, { message: 'not authorized' });
      return;
    }

    const oldTopic = meeting.currentTopic;
    if (meeting.queuedSpeakers.length === 0) {
      if (meeting.currentAgendaItem) {
        meeting.currentSpeaker = {
          id: uuid(),
          user: meeting.currentAgendaItem.user,
          topic: 'Presenting: ' + meeting.currentAgendaItem.name,
          type: 'topic'
        };
      } else {
        // not sure if this can happen with current meeting flow
        meeting.currentSpeaker = undefined;
      }
      meeting.currentTopic = undefined;
    } else {
      meeting.currentSpeaker = meeting.queuedSpeakers.shift()!;
      if (meeting.currentSpeaker.type === 'topic') {
        meeting.currentTopic = meeting.currentSpeaker;
      }
    }

    await updateMeeting(meeting);
    respond(200);
    emitAll(Message.Type.newCurrentSpeaker, meeting.currentSpeaker);
    if (oldTopic !== meeting.currentTopic) {
      emitAll(Message.Type.newCurrentTopic, meeting.currentTopic);
    }
  }

  function instrumentSocketFn(fn: (r: Responder, ...args: any[]) => Promise<any>) {
    let start: number;

    function respond(status: number, message?: any) {
      if (!message) message = {};
      message.status = status;
      socket.emit(Message.Type.Response, message);
      client.trackRequest({
        resultCode: String(status),
        name: 'WebSocket Handler: ' + fn.name,
        duration: Date.now() - start,
        url: socket.handshake.url,
        success: String(status)[0] === '2'
      });
    }

    return function(...args: any[]): Promise<any> {
      start = Date.now();
      return waitTurn(() => fn.call(undefined, respond, ...args));
    };
  }

  function disconnect() {
    socks.delete(socket);
  }
}

interface Responder {
  (code: number, message?: object): void;
}

function emitAll(type: Message.Type, ...args: any[]) {
  socks.forEach(s => {
    // sad cast is sad
    s.emit(type, ...args);
  });
}

function timeout(t: number) {
  return new Promise(res => {
    setTimeout(() => res(), t);
  });
}
