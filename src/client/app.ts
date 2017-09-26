import Vue from 'vue';
import { QueuedSpeaker } from './components/QueuedSpeaker';
import { CurrentSpeaker } from './components/CurrentSpeaker';
import { SpeakerControls } from './components/SpeakerControls';

import * as socketio from 'socket.io-client';
import Speaker from '../shared/Speaker';

const template = `
<div id=app>
  <div id=info>
    <current-speaker :speaker=currentSpeaker @current-speaker-finished=nextSpeaker></current-speaker>
  </div>
  <div id="queue-container">
    <h2>Speaker Queue</h2>
    <queued-speaker v-for="speaker in queuedSpeakers" :key="speaker.id" v-bind="{ speaker: speaker }"></queued-speaker>
  </div>
  <speaker-controls
    @new-topic=newTopic
    :currentTopic="this.currentSpeaker ? this.currentSpeaker.topic : ''"
    >
  </speaker-controls>
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

socket.on('newSpeaker', (data: { position: number; speaker: Speaker }) => {
  app.queuedSpeakers.splice(data.position, 0, data.speaker);
});

socket.on('nextSpeaker', (data: Speaker) => {
  app.currentSpeaker = data;
  app.queuedSpeakers.shift();
});

let app = new Vue({
  el: '#app',
  template,
  data: {
    userGhid: ghid as string,
    currentSpeaker: null as Speaker | null,
    queuedSpeakers: [] as Speaker[]
  },
  components: {
    QueuedSpeaker,
    CurrentSpeaker,
    SpeakerControls
  },
  methods: {
    newTopic(description: { type: string; topic: string }) {
      socket.emit('newTopic', description);
    },

    nextSpeaker() {
      socket.emit('nextSpeaker');
    }
  }
});

(window as any).app = app;
