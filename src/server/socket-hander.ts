import Meeting from '../shared/Meeting';
import Speaker from '../shared/Speaker';
import AgendaItem from '../shared/AgendaItem';
import User, { getByUsername } from './User';
import Reaction, { ReactionTypes } from '../shared/Reaction';
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
import { EmitEventNames } from 'strict-event-emitter-types';

let socks = new Map<string, Set<Message.ServerSocket>>();

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

  let meetingSocks = socks.get(meetingId);
  if (!meetingSocks) {
    meetingSocks = new Set();
    socks.set(meetingId, meetingSocks);
  }

  meetingSocks.add(socket);

  let githubUser: GitHubAuthenticatedUser = (socket.handshake as any).session.passport.user;
  let ghapi = gha(githubUser.accessToken);

  let user: User = {
    name: githubUser.name,
    organization: githubUser.organization,
    ghid: githubUser.ghid,
    ghUsername: githubUser.ghUsername
  };

  const meeting = await getMeeting(meetingId);

  let state: Message.State = Object.keys(meeting)
    .filter(k => k[0] !== '_')
    .reduce((s, k) => {
      (s as any)[k] = (meeting as any)[k];
      return s;
    }, {}) as any;

  state.user = user;

  socket.emit('state', state);
  socket.on('newQueuedSpeakerRequest', instrumentSocketFn(newTopic));
  socket.on('deleteQueuedSpeakerRequest', instrumentSocketFn(deleteQueuedSpeaker));
  socket.on('nextSpeaker', instrumentSocketFn(nextSpeaker));
  socket.on('disconnect', disconnect);
  socket.on('newAgendaItemRequest', instrumentSocketFn(newAgendaItem));
  socket.on('reorderAgendaItemRequest', instrumentSocketFn(reorderAgendaItem));
  socket.on('reorderQueueRequest', instrumentSocketFn(reorderQueue));
  socket.on('deleteAgendaItemRequest', instrumentSocketFn(deleteAgendaItem));
  socket.on('nextAgendaItemRequest', instrumentSocketFn(nextAgendaItem));
  socket.on('newReactionRequest', instrumentSocketFn(newReaction));
  socket.on('trackTemperatureRequest', instrumentSocketFn(trackTemperature));

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
    emitAll(meetingId, 'nextAgendaItem', meeting.currentAgendaItem);
    emitAll(meetingId, 'newCurrentSpeaker', meeting.currentSpeaker);
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
    emitAll(meetingId, 'deleteAgendaItem', message);
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
    emitAll(meetingId, 'reorderAgendaItem', message);
  }

  async function reorderQueue(respond: Responder, message: Message.ReorderQueueRequest) {
    const meeting = await getMeeting(meetingId);
    if (!isChair(user, meeting)) {
      respond(403);
      return;
    }

    const item = meeting.queuedSpeakers[message.oldIndex];

    if (!item) {
      respond(500, { message: 'Could not find queue item' });
      return;
    }

    if (item.id !== message.id) {
      respond(500, { message: 'Stale request, denied' });
      return;
    }

    if (message.newIndex < 0 || message.newIndex >= meeting.queuedSpeakers.length) {
      respond(400, { message: 'Cant move past beginning or end' });
    }

    if (
      Math.abs(message.newIndex - message.oldIndex) === 1 &&
      meeting.queuedSpeakers[message.newIndex].type !==
        meeting.queuedSpeakers[message.oldIndex].type
    ) {
      // we're moving across a type boundary, so just update the type.
      meeting.queuedSpeakers[message.oldIndex].type = meeting.queuedSpeakers[message.newIndex].type;
      await updateMeeting(meeting);
      respond(200);
      emitAll(meetingId, 'updateQueuedSpeaker', meeting.queuedSpeakers[message.oldIndex]);
    } else {
      // actually move the speaker
      meeting.queuedSpeakers.splice(
        message.newIndex,
        0,
        meeting.queuedSpeakers.splice(message.oldIndex, 1)[0]
      );
      await updateMeeting(meeting);
      respond(200);
      emitAll(meetingId, 'reorderQueue', message);
    }
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

    if (isNaN(agendaItem.timebox)) {
      respond(400, { message: 'Timebox duration required' });
      return;
    }

    meeting.agenda.push(agendaItem);
    await updateMeeting(meeting);
    client.trackEvent({ name: 'New Agenda Item' });
    emitAll(meetingId, 'newAgendaItem', agendaItem);
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
    emitAll(meetingId, 'newQueuedSpeaker', {
      position: index,
      speaker: speaker
    });
    client.trackEvent({ name: 'New Speaker' });
    respond(200);
  }

  async function newReaction(respond: Responder, message: Message.NewReactionRequest) {
    const reaction: Reaction = {
      user: user,
      reaction: message.reactionType
    };

    const meeting = await getMeeting(meetingId);
    if (!meeting.reactions) {
      meeting.reactions = [];
    }

    const { reactions } = meeting;

    let index = reactions.findIndex(function(r) {
      return r.reaction == reaction.reaction && r.user.ghid == reaction.user.ghid}
    );
    
    if (index === -1) {
      reactions.push(reaction);
      await updateMeeting(meeting);
      emitAll(meetingId, 'newReaction', reaction);
    } else {
      reactions.splice(index, 1);
      await updateMeeting(meeting);
      emitAll(meetingId, 'deleteReaction', reaction);
    }
    respond(200);
  }

  async function trackTemperature(respond: Responder, message: Message.TrackTemperatureRequest) {
    const meeting = await getMeeting(meetingId);
    if (!message.track) {
      meeting.reactions = [];
      await updateMeeting(meeting);
    }
    meeting.trackTemperature = message.track;
    emitAll(meetingId, 'trackTemperature', message.track);
  }

  async function deleteQueuedSpeaker(
    respond: Responder,
    message: Message.DeleteQueuedSpeakerRequest
  ) {
    const meeting = await getMeeting(meetingId);

    const { queuedSpeakers } = meeting;

    let index = queuedSpeakers.findIndex(function(queuedSpeaker) {
      return queuedSpeaker.id === message.id;
    });

    if (index === -1) {
      respond(404);
      return;
    }

    if (!isChair(user, meeting) && queuedSpeakers[index].user.ghid !== user.ghid) {
      // unauthorized
      respond(403, { message: 'not authorized' });
      return;
    }

    queuedSpeakers.splice(index, 1);

    await updateMeeting(meeting);
    emitAll(meetingId, 'deleteQueuedSpeaker', message);
    respond(200);
  }

  async function nextSpeaker(respond: Responder, message: Message.NextSpeakerRequest) {
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

    if (meeting.currentSpeaker && meeting.currentSpeaker.id !== message.currentSpeakerId) {
      respond(400, { message: 'stale state, next speaker ignored' });
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
    emitAll(meetingId, 'newCurrentSpeaker', meeting.currentSpeaker);
    if (oldTopic !== meeting.currentTopic) {
      emitAll(meetingId, 'newCurrentTopic', meeting.currentTopic);
    }
  }

  function instrumentSocketFn(fn: (r: Responder, ...args: any[]) => Promise<any>) {
    let start: number;

    function respond(status: number, message?: any) {
      if (!message) message = {};
      message.status = status;
      socket.emit('response', message);
      client.trackRequest({
        resultCode: String(status),
        name: 'WebSocket Handler: ' + fn.name,
        duration: Date.now() - start,
        url: socket.handshake.url,
        success: String(status)[0] === '2'
      });
    }

    return function(...args: any[]) {
      start = Date.now();
      fn.call(undefined, respond, ...args);
    };
  }

  function disconnect() {
    if (!meetingSocks) return;
    meetingSocks.delete(socket);

    if (meetingSocks.size === 0) {
      socks.delete(meetingId);
    }
  }
}

interface Responder {
  (code: number, message?: object): void;
}

const emitAll = function(meetingId: string, type: EmitEventNames<Message.ServerSocket>, arg?: any) {
  const ss = socks.get(meetingId);
  if (!ss) return;

  ss.forEach(s => {
    s.emit(type as any, arg);
  });
};
