import User from './User';

interface AgendaItem {
  name: string;
  description?: string;
  timebox?: number;
  user: User;
  id: string;
}

export default AgendaItem;
