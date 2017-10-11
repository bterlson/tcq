import Vue from 'vue';
import { QueuedSpeaker } from './QueuedSpeaker';
import { CurrentSpeaker } from './CurrentSpeaker';
import { SpeakerControls } from './SpeakerControls';
import * as socketio from 'socket.io-client';
import Speaker from '../../shared/Speaker';
import appTemplate from './app.html';

let AppComponent = Vue.extend({
  data: function() {
    return {
      userGhid: ghid as string,
      currentSpeaker: null as Speaker | null,
      queuedSpeakers: [] as Speaker[],
      socket: socketio.Socket
    };
  },
  components: {
    QueuedSpeaker,
    CurrentSpeaker,
    SpeakerControls
  },
  methods: {
    newTopic(description: { type: string; topic: string }) {
      this.socket.emit('newTopic', description);
    },

    nextSpeaker() {
      this.socket.emit('nextSpeaker');
    }
  },
  created() {
    this.socket = socketio.connect({
      transports: ['websocket'],
      upgrade: false
    });

    this.socket.on('state', (data: any) => {
      this.queuedSpeakers = data.queuedSpeakers;
      this.currentSpeaker = data.currentSpeaker;
    });

    this.socket.on('newSpeaker', (data: { position: number; speaker: Speaker }) => {
      this.queuedSpeakers.splice(data.position, 0, data.speaker);
    });

    this.socket.on('nextSpeaker', (data: Speaker) => {
      this.currentSpeaker = data;
      this.queuedSpeakers.shift();
    });
  }
});

// apply template
let App = appTemplate(AppComponent);
new App({ el: '#app' });
