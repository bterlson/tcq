import Speaker from './Speaker';
import AgendaItem from './AgendaItem';
import User from './User';
interface Meeting {
  chairs: User[];
  currentAgendaItemId: string | null;
  currentSpeaker: Speaker | null;
  queuedSpeakers: Speaker[];
  agenda: AgendaItem[];
  id: string;
}

export default Meeting;
