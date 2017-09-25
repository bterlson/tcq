import Speaker from './Speaker';

interface Meeting {
  currentSpeaker: Speaker | null;
  queuedSpeakers: Speaker[];
}
export default Meeting;
