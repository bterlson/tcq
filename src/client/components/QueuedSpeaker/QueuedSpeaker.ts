import Vue from 'vue';
import Speaker from '../../../shared/Speaker';
import template from './QueuedSpeaker.html';
import * as Message from '../../../shared/Messages';
import './QueuedSpeaker.scss';
import { request } from '../../ClientSocket';

export const QueuedSpeaker = template(
  Vue.extend({
    props: {
      speaker: {
        default: {} as Speaker
      },
      index: {
        default: 0
      }
    },
    computed: {
      displayedOrg(): string {
        return this.speaker.user.organization ? ` (${this.speaker.user.organization})` : '';
      },
      isMe(): boolean {
        return this.speaker.user.ghid === (this.$root as any).user.ghid;
      }
    },
    methods: {
      async dequeue() {
        await request('deleteQueuedSpeakerRequest', {
          id: this.speaker.id
        });
      }
    }
  })
);
