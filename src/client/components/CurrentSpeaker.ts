import Vue from 'vue';
import Speaker from '../../shared/Speaker';
import template from './CurrentSpeaker.html';

let str = 'hello';

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
        return this.speaker.organization ? ` (${this.speaker.organization})` : '';
      },

      isMe(): boolean {
        return this.speaker.ghid === ghid;
      },

      isChair(): boolean {
        return isChair;
      }
    }
  })
);
