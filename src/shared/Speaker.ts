export default interface Speaker {
  name: string;
  organization?: string;
  topic?: string;
  type: 'topic' | 'reply' | 'question' | 'poo';
  ghid: string | null;
};
