import { TopicTypes } from './Speaker';
import Meeting from './Meeting';
import Speaker from './Speaker';
import User from './User';
import AgendaItem from './AgendaItem';
import StrictEventEmitter, { StrictBroadcast } from 'strict-event-emitter-types';

interface ServerEvents {
  newQueuedSpeakerRequest: NewQueuedSpeakerRequest,
  nextSpeaker: NextSpeakerRequest,
  nextAgendaItemRequest: NextAgendaItemRequest,
  newAgendaItemRequest: NewAgendaItemRequest,
  reorderAgendaItemRequest: ReorderAgendaItemRequest,
  deleteAgendaItemRequest: DeleteAgendaItemRequest,
  userInfo: User,
  disconnect: void
}

interface ClientEvents {
  nextAgendaItem: NextAgendaItem,
  newCurrentSpeaker: NewCurrentSpeaker,
  newQueuedSpeaker: NewQueuedSpeaker,
  newAgendaItem: AgendaItem,
  newCurrentTopic: NewCurrentTopic,
  reorderAgendaItem: ReorderAgendaItem,
  deleteAgendaItem: DeleteAgendaItem,
  disconnect: void,
  state: State,
  response: Response
}

export interface Response {
  status: number;
  message?: string;
}
export interface NewQueuedSpeakerRequest {
  type: TopicTypes;
  topic: string;
  id: string;
}

export interface NewQueuedSpeaker {
  position: number;
  speaker: Speaker;
}

export interface NewAgendaItemRequest {
  name: string;
  timebox?: string;
  ghUsername: string;
}

export interface DeleteAgendaItem {
  index: number;
}

export interface DeleteAgendaItemRequest {
  index: number;
}

export interface ReorderAgendaItem {
  oldIndex: number;
  newIndex: number;
}

export interface ReorderAgendaItemRequest {
  oldIndex: number;
  newIndex: number;
}
export interface State extends Meeting {
  user: User;
}

export interface NextAgendaItemRequest {
  currentItemId?: string;
}

export interface NextSpeakerRequest {
  currentSpeakerId: string;
}
export interface NextAgendaItem extends AgendaItem { }
export type NewCurrentSpeaker = Speaker | undefined;
export type NewCurrentTopic = Speaker | undefined;

export type ServerSocket = StrictEventEmitter<SocketIO.Socket, ServerEvents, ClientEvents>;
export type ClientSocket = StrictEventEmitter<SocketIOClient.Socket, ClientEvents, ServerEvents>;
export type ClientBroadcast = StrictBroadcast<ClientSocket>;
