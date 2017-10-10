export default interface Speaker {
  name: string;
  organization?: string;
  topic?: string;
  type: TopicTypes;
  ghid: string | null;
};

export type TopicTypes = 'topic' | 'reply' | 'question' | 'poo';
