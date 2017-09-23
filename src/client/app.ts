import Vue from 'vue';
import { QueuedSpeaker } from './components/QueuedSpeaker';
import { CurrentSpeaker } from './components/CurrentSpeaker';
import { NewTopicControl } from './components/NewTopicControl';
import * as socketio from 'socket.io-client';
import Speaker from '../shared/speaker';

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

let socket = socketio.connect({
  transports: ['websocket'],
  upgrade: false
});

socket.on('state', (data: any) => {
  app.queuedSpeakers = data.queuedSpeakers;
  app.currentSpeaker = data.currentSpeaker;
});

socket.on('newSpeaker', (data: any) => {
  app.queuedSpeakers.splice(data.position, 0, data.speaker);
});

let app = new Vue({
  el: '#app',
  template,
  data: {
    currentSpeaker: null as Speaker | null,
    queuedSpeakers: [] as Speaker[]
  },
  components: {
    QueuedSpeaker,
    CurrentSpeaker,
    NewTopicControl
  },
  methods: {
    clarify() {},
    poo() {},
    newTopic(description: string) {
      socket.emit('newTopic', { topic: description });
    },
    newReply() {}
  }
});

(window as any).app = app;
