import { UniqueId } from 'documentdb';

export interface Meeting extends UniqueId {
  currentSpeaker?: Speaker;
  queuedSpeakers: Speaker[];
}

export interface Speaker extends UniqueId {
  firstName: string;
  lastName: string;
  organization: string;
}
