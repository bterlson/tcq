import Vue from 'vue';
import Speaker from '../../shared/Speaker';

const template = `
<div class="queue-item" v-bind:class="'queue-type-' + speaker.type">
    {{speaker.name}}</span>{{displayedOrg}}: {{speaker.topic}}
</div>
`;

export const QueuedSpeaker = Vue.extend({
  template,
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
});
