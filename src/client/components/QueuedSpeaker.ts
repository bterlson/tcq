import Vue from 'vue';
import Speaker from '../../shared/speaker';

const template = `
<div class="queue-item">
    <span>{{speaker.firstName}} {{speaker.lastName}}</span>{{displayedOrg}}
</div>
`;
console.log('here!');

export const QueuedSpeaker = Vue.extend({
  template,
  props: {
    speaker: {
      default: {} as Speaker
    }
  },
  computed: {
    displayedOrg(): string {
      return ` (${this.speaker.organization})`;
    }
  }
});
