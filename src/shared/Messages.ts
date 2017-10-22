import { TopicTypes } from './Speaker';
import Meeting from './Meeting';
import Speaker from './Speaker';
import User from './User';
import AgendaItem from './AgendaItem';

export enum Type {
  newTopic = 'newTopic',
  nextSpeaker = 'nextSpeaker',
  newCurrentSpeaker = 'newCurrentSpeaker',
  newQueuedSpeaker = 'newQueuedSpeaker',
  newAgendaItemRequest = 'newAgendaItemRequest',
  newAgendaItem = 'newAgendaItem',
  deleteAgendaItemRequest = 'deleteAgendaItemRequest',
  deleteAgendaItem = 'deleteAgendaItem',
  reorderAgendaItemRequest = 'reorderAgendaItemRequest',
  reorderAgendaItem = 'reorderAgendaItem',
  Response = 'Response',
  userInfo = 'userInfo',
  state = 'state',
  disconnect = 'disconnect'
}
export interface Response {
  status: number;
  message?: string;
}
export interface NewTopic {
  type: TopicTypes;
  topic: string;
  uuid: string;
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

export type NewCurrentSpeaker = Speaker | null;
type SomeSocket = SocketIO.Socket | SocketIOClient.Socket;

// any return types used as client and server sockets are not consistent with what they return.
interface TypedSocket {
  on(type: Type.newTopic, cb: (message: NewTopic) => void): any;
  emit(type: Type.newTopic, message: NewTopic): any;

  on(type: Type.nextSpeaker, cb: () => void): any;
  emit(type: Type.nextSpeaker): any;

  on(type: Type.state, cb: (message: State) => void): any;
  emit(type: Type.state, message: State): any;

  on(type: Type.newCurrentSpeaker, cb: (message: NewCurrentSpeaker) => void): any;
  emit(type: Type.newCurrentSpeaker, message: NewCurrentSpeaker): any;

  on(type: Type.newQueuedSpeaker, cb: (message: NewQueuedSpeaker) => void): any;
  emit(type: Type.newQueuedSpeaker, message: NewQueuedSpeaker): any;

  // newAgendaItem
  on(type: Type.newAgendaItemRequest, cb: (message: NewAgendaItemRequest) => void): any;
  emit(type: Type.newAgendaItemRequest, message: NewAgendaItemRequest): any;

  on(type: Type.newAgendaItem, cb: (message: AgendaItem) => void): any;
  emit(type: Type.newAgendaItem, message: AgendaItem): any;

  // delete agenda item
  on(type: Type.deleteAgendaItemRequest, cb: (message: DeleteAgendaItemRequest) => void): any;
  emit(type: Type.deleteAgendaItemRequest, message: DeleteAgendaItemRequest): any;

  on(type: Type.deleteAgendaItem, cb: (message: DeleteAgendaItem) => void): any;
  emit(type: Type.deleteAgendaItem, message: DeleteAgendaItem): any;

  // reorderAgendaItem
  on(type: Type.reorderAgendaItemRequest, cb: (message: ReorderAgendaItemRequest) => void): any;
  emit(type: Type.reorderAgendaItemRequest, message: ReorderAgendaItemRequest): any;

  on(type: Type.reorderAgendaItem, cb: (message: ReorderAgendaItem) => void): any;
  emit(type: Type.reorderAgendaItem, message: ReorderAgendaItem): any;

  on(type: Type.userInfo, cb: (message: User) => void): any;
  emit(type: Type.userInfo, message: User): any;

  on(type: Type.Response, cb: (message: Response) => void): any;
  emit(type: Type.Response, message: Response): any;

  on(type: Type.disconnect, cb: () => void): any;
}
export type ServerSocket = TypedSocket & SocketIO.Socket;
export type ClientSocket = TypedSocket & SocketIOClient.Socket;
