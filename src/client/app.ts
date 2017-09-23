import Vue from 'vue';
import { QueuedSpeaker } from './components/QueuedSpeaker';
import { CurrentSpeaker } from './components/CurrentSpeaker';
import { NewTopicControl } from './components/NewTopicControl';

const currentSpeaker = {
  firstName: 'Brian',
  lastName: 'Terlson',
  organization: 'Microsoft'
};

const queuedSpeakers = [
  { firstName: 'Daniel', lastName: 'Rosenwasser', organization: 'Microsoft' },
  { firstName: 'Yehuda', lastName: 'Katz', organization: 'Tilde' },
  { firstName: 'David', lastName: 'Herman', organization: 'LinkedIn' },
  { firstName: 'aaa', lastName: '', organization: '' },
  { firstName: 'bbb', lastName: '', organization: '' },
  { firstName: 'aaa', lastName: '', organization: '' },
  { firstName: 'bbb', lastName: '', organization: '' },
  { firstName: 'aaa', lastName: '', organization: '' },
  { firstName: 'bbb', lastName: '', organization: '' }
].map((speaker, id) => ({ ...speaker, id }));

const template = `
<div id=app>
  <div id=info>
    <current-speaker :speaker="currentSpeaker"></current-speaker>
  </div>
  <div id="queue-container">
    <h2>Speaker Queue</h2>
    <queued-speaker v-for="speaker in queuedSpeakers" :key="speaker.id" v-bind="{ speaker: speaker }"></queued-speaker>
  </div>
  <div id="speaker-controls">
    <new-topic-control @new-topic=newTopic @new-reply=newReply></new-topic-control>
    <div id=speaker-question @click=clarify>Clarifying Question</div>
    <div id=speaker-poo @click=poo>Point of Order</div>
  </div>
</div>
`;

let app = new Vue({
  el: '#app',
  template,
  data: {
    currentSpeaker,
    queuedSpeakers
  },
  components: {
    QueuedSpeaker,
    CurrentSpeaker,
    NewTopicControl
  },
  methods: {
    clarify() {},
    poo() {},
    newTopic(description: string) {},
    newReply() {}
  }
});

(window as any).app = app;
