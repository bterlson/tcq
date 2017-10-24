import Speaker from './Speaker';
import AgendaItem from './AgendaItem';
import User from './User';
interface Meeting {
  chairs: User[];
  currentAgendaItem: AgendaItem | undefined;
  currentSpeaker: Speaker | undefined;
  queuedSpeakers: Speaker[];
  currentTopic: Speaker | undefined;
  agenda: AgendaItem[];
  id: string;
  timeboxEnd: Date | string | undefined;
  timeboxSecondsLeft: number | undefined;
}

export default Meeting;
