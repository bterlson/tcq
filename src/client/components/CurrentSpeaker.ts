import Vue from 'vue';
import Speaker from '../../shared/speaker';

const template = `
    <div v-if="speaker" id="current-speaker">
        <h2>Current Speaker</h2>
        <div class=current-topic>{{speaker.topic}}</div>
        <div>{{speaker.name}}{{displayedOrg}}</div>
        <div v-if="isMe" id="current-speaker-controls">
          <button @click=doneSpeaking>I'm Done Speaking</button> 
        </div>
        <div v-if="!isMe && isChair" id="current-speaker-chair-controls">
          <button @click=doneSpeaking>Next Speaker</button> 
        </div>
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
});
