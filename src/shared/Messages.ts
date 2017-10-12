import { TopicTypes } from './Speaker';
import Meeting from './Meeting';
import Speaker from './Speaker';

export enum Type {
  newTopic = 'newTopic',
  nextSpeaker = 'nextSpeaker',
  newCurrentSpeaker = 'newCurrentSpeaker',
  newQueuedSpeaker = 'newQueuedSpeaker',
  state = 'state',
  disconnect = 'disconnect'
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

export interface State extends Meeting {}

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

  on(type: Type.disconnect, cb: () => void): any;
}
export type ServerSocket = TypedSocket & SocketIO.Socket;
export type ClientSocket = TypedSocket & SocketIOClient.Socket;
