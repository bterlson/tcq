import Vue from 'vue';
import Reaction, { ReactionTypes } from '../../../shared/Reaction';
import template from './TempCheck.html';
import AgendaItem from '../../../shared/AgendaItem';
import * as Message from '../../../shared/Messages';
import uuid from 'uuid';
import './TempCheck.scss';
import { request } from '../../ClientSocket';

export const TempCheck = template(
  Vue.extend({
    props: {
      reactions: {
        default: undefined as Reaction[] | undefined
      },
    },
    methods: {
      react: async function (type: ReactionTypes) {
        await request('newReactionRequest', {
          reactionType: type,
        } as Message.NewReactionRequest);
      },
      countReactions: function(reactions: Reaction[], type: ReactionTypes) {
        if (this.reactions) {
          return this.reactions.filter(reaction => reaction.reaction == type).length;
        }
        return 0;
      },
    }
  })
);
