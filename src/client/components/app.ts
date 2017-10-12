import Vue from 'vue';
import { QueuedSpeaker } from './QueuedSpeaker';
import { CurrentSpeaker } from './CurrentSpeaker';
import { SpeakerControls } from './SpeakerControls';
import * as socketio from 'socket.io-client';
import Speaker from '../../shared/Speaker';
import appTemplate from './app.html';
import * as Message from '../../shared/Messages';

let AppComponent = Vue.extend({
  data: function() {
    return {
      userGhid: ghid as string,
      currentSpeaker: null as Speaker | null,
      queuedSpeakers: [] as Speaker[],
      socket: null as Message.ClientSocket | null
    };
  },
  components: {
    QueuedSpeaker,
    CurrentSpeaker,
    SpeakerControls
  },
  methods: {
    newTopic(message: Message.NewTopic) {
      if (!this.socket) return;
      this.socket.emit(Message.Type.newTopic, message); // make this {} and you'll get an error on the wrong param?
    },

    nextSpeaker() {
      if (!this.socket) return;
      this.socket.emit('nextSpeaker');
    }
  },
  created() {
    this.socket = socketio.connect({
      transports: ['websocket'],
      upgrade: false
    });

    this.socket.on(Message.Type.state, data => {
      this.queuedSpeakers = data.queuedSpeakers;
      this.currentSpeaker = data.currentSpeaker;
    });

    this.socket.on(Message.Type.newQueuedSpeaker, data => {
      this.queuedSpeakers.splice(data.position, 0, data.speaker);
    });

    this.socket.on(Message.Type.newCurrentSpeaker, data => {
      this.currentSpeaker = data;
      this.queuedSpeakers.shift();
    });
  }
});

// apply template
let App = appTemplate(AppComponent);
new App({ el: '#app' });
