import * as uuid from 'uuid';

export default interface Speaker {
  name: string;
  organization?: string;
  topic?: string;
  type: TopicTypes;
  ghid: string | null;
  uuid: string;
};

export type TopicTypes = 'topic' | 'reply' | 'question' | 'poo';
