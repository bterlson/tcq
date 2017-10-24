import * as uuid from 'uuid';
import User from './User';

export default interface Speaker {
  topic: string;
  type: TopicTypes;
  user: User;
  id: string;
};

export type TopicTypes = 'topic' | 'reply' | 'question' | 'poo';
