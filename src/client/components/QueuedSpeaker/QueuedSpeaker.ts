import Vue from 'vue';
import Speaker from '../../../shared/Speaker';
import template from './QueuedSpeaker.html';
import './QueuedSpeaker.scss';

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
      }
    }
  })
);
