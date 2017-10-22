import User from '../../../shared/User';
import Vue from 'vue';
import { QueuedSpeaker } from '../QueuedSpeaker/QueuedSpeaker';
import { CurrentSpeaker } from '../CurrentSpeaker/CurrentSpeaker';
import { SpeakerControls } from '../SpeakerControls/SpeakerControls';
import { Agenda } from '../Agenda/Agenda';
import * as socketio from 'socket.io-client';
import Speaker from '../../../shared/Speaker';
import appTemplate from './app.html';
import * as Message from '../../../shared/Messages';
import './app.scss';
import AgendaItem from '../../../shared/AgendaItem';
import Meeting from '../../../shared/Meeting';

interface AdditionalAppState {
  user: User;
  socket: Message.ClientSocket | null;
  view: 'agenda' | 'queue';
  notifyRequestFailure: Function; // TODO
  notifyRequestSuccess: Function;
  isChair: boolean;
}
// TODO: Can't have more than one app...
let pendingRequest = null as Promise<Message.Response> | null;

let AppComponent = Vue.extend({
  data: function() {
    return {
      id: '',
      isChair: false,
      chairs: [] as User[],
      user: {} as User,
      currentSpeaker: null,
      queuedSpeakers: [],
      currentAgendaItemId: null,
      agenda: [],
      socket: null,
      view: 'agenda',
      notifyRequestFailure: () => {},
      notifyRequestSuccess: () => {}
    } as Meeting & AdditionalAppState;
  },
  components: {
    QueuedSpeaker,
    CurrentSpeaker,
    SpeakerControls,
    Agenda
  },
  methods: {
    newTopic(message: Message.NewTopic) {
      if (!this.socket) return;
      this.socket.emit(Message.Type.newTopic, message); // make this {} and you'll get an error on the wrong param?
    },

    nextSpeaker() {
      if (!this.socket) return;
      this.socket.emit('nextSpeaker');
    },

    toggleMenu() {
      (this.$refs['menu'] as Element).classList.toggle('is-active');
    },

    showQueue() {
      (this.$refs['agenda'] as Vue).$el.setAttribute('style', 'display: none;');
      (this.$refs['queue'] as Element).setAttribute('style', '');
    },

    showAgenda() {
      (this.$refs['queue'] as Element).setAttribute('style', 'display: none;');
      (this.$refs['agenda'] as Vue).$el.setAttribute('style', '');
    },

    sendRequest(type: Message.Type, message: any) {
      let p = new Promise((resolve, reject) => {
        this.notifyRequestSuccess = resolve;
        this.notifyRequestFailure = reject;
      });

      if (this.socket) {
        this.socket.emit(type, message);
      } else {
        // probably wait on socket.
        return Promise.reject('No connection to server.');
      }

      return p;
    },
    notifyResponse(response: Message.Response) {
      if (response.status === 200) {
        this.notifyRequestSuccess(response);
      } else {
        this.notifyRequestFailure(response);
      }
    }
  },
  watch: {
    chairs() {
      this.isChair = this.chairs.some(u => {
        console.log(u.ghid, this.user.ghid);
        return u.ghid === this.user.ghid;
      });
      console.log(this.user);
      console.log(this.isChair);
    }
  },
  created() {
    const match = document.location.href.match(/meeting\/(.*)$/);
    if (!match) throw new Error('Failed to find meeting id');
    this.id = match[1];
    this.socket = socketio.connect({
      transports: ['websocket'],
      upgrade: false,
      query: `id=${this.id}`
    });

    this.socket.on(Message.Type.state, data => {
      this.queuedSpeakers = data.queuedSpeakers;
      this.currentSpeaker = data.currentSpeaker;
      this.agenda = data.agenda;
      this.chairs = data.chairs;
      this.user = data.user;
    });

    this.socket.on(Message.Type.newQueuedSpeaker, data => {
      this.queuedSpeakers.splice(data.position, 0, data.speaker);
    });

    this.socket.on(Message.Type.newCurrentSpeaker, data => {
      this.currentSpeaker = data;
      this.queuedSpeakers.shift();
    });

    this.socket.on(Message.Type.newAgendaItem, data => {
      this.agenda.push(data);
    });

    this.socket.on(Message.Type.Response, data => {
      this.notifyResponse(data);
    });

    this.socket.on(Message.Type.reorderAgendaItem, data => {
      this.agenda.splice(data.newIndex, 0, this.agenda.splice(data.oldIndex, 1)[0]);
    });

    this.socket.on(Message.Type.deleteAgendaItem, data => {
      this.agenda.splice(data.index, 1);
    });
  }
});

// apply template
let App = appTemplate(AppComponent);

export default App;
