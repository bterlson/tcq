import Vue from 'vue';
import Speaker from '../../shared/speaker';

const template = `
    <div v-if="speaker" id="current-speaker">
        <h2>Current speaker</h2>
        <div>{{speaker.name}}</div>
        <div v-show="speaker.organization">{{speaker.organization}}</div>
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
  template
});
