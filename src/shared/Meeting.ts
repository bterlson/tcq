import Speaker from './Speaker';
import AgendaItem from './AgendaItem';

interface Meeting {
  currentSpeaker: Speaker | null;
  queuedSpeakers: Speaker[];
  agenda: AgendaItem[];
}
export default Meeting;
