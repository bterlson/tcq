import Vue from 'vue';
import Speaker from '../../shared/Speaker';
import template from './QueuedSpeaker.html';

export const QueuedSpeaker = template(
  Vue.extend({
    props: {
      speaker: {
        default: {} as Speaker
      }
    },
    computed: {
      displayedOrg(): string {
        return this.speaker.organization ? ` (${this.speaker.organization})` : '';
      }
    }
  })
);
