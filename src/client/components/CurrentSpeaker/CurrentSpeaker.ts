import Vue from 'vue';
import Speaker from '../../../shared/Speaker';
import template from './CurrentSpeaker.html';

export const CurrentSpeaker = template(
  Vue.extend({
    props: {
      speaker: {
        default: null as Speaker | null
      }
    },
    methods: {
      doneSpeaking() {
        this.$emit('current-speaker-finished');
      }
    },
    computed: {
      displayedOrg(): string {
        return this.speaker.user.organization ? ` (${this.speaker.user.organization})` : '';
      },

      isMe(): boolean {
        return this.speaker.user.ghid === ghid;
      },

      isChair(): boolean {
        return isChair;
      }
    }
  })
);
