import Vue from 'vue';
import Speaker from '../../shared/speaker';

const template = `
    <div v-if="speaker" id="current-speaker">
        <h2>Current Speaker</h2>
        <div class=current-topic>{{speaker.topic}}</div>
        <div>{{speaker.name}}{{displayedOrg}}</div>
    </div>
    <div v-else>
        <h2>No active speaker</h2>
    </div>
`;

let str = 'hello';

export const CurrentSpeaker = Vue.extend({
  props: {
    speaker: {
      default: null as Speaker | null
    }
  },
  template,
  computed: {
    displayedOrg(): string {
      return this.speaker.organization ? ` (${this.speaker.organization})` : '';
    }
  }
});
