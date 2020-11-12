import User from './User';

export default interface Reaction {
  reaction: ReactionTypes;
  user: User;
}

export type ReactionTypes = '❤️' | '👍' | '🤷' | '😕';