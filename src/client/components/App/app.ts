import User from '../../../shared/User';
import Vue from 'vue';

import { QueueControl } from '../QueueControl/QueueControl';

import { Agenda } from '../Agenda/Agenda';

import Speaker from '../../../shared/Speaker';
import appTemplate from './app.html';

import './app.scss';
import AgendaItem from '../../../shared/AgendaItem';
import Meeting from '../../../shared/Meeting';
import * as Message from '../../../shared/Messages';
import socket from '../../ClientSocket';

Vue.mixin({
  methods: {
    formatUser(user: User) {
      let str = '';
      if (user.name) {
        str += user.name;
      } else {
        str += '@' + user.ghUsername;
      }

      if (user.organization) {
        str += ' (' + user.organization + ')';
      }

      return str;
    }
  }
});
interface AdditionalAppState {
  user: User;
  view: 'agenda' | 'queue';
  notifyRequestFailure: Function; // TODO
  notifyRequestSuccess: Function;
  isChair: boolean;
}

let AppComponent = Vue.extend({
  data: function() {
    return {
      id: '',
      isChair: false,
      chairs: [] as User[],
      user: {} as User,
      currentSpeaker: undefined,
      currentTopic: undefined,
      queuedSpeakers: [],
      currentAgendaItem: undefined,
      agenda: [],
      view: 'agenda',
      timeboxEnd: undefined,
      timeboxSecondsLeft: undefined,
      notifyRequestFailure: () => {},
      notifyRequestSuccess: () => {}
    } as Meeting & AdditionalAppState;
  },
  components: {
    Agenda,
    QueueControl
  },
  methods: {
    newTopic(message: Message.NewQueuedSpeakerRequest) {
      if (!this.socket) return;
      this.socket.emit('newQueuedSpeakerRequest', message); // make this {} and you'll get an error on the wrong param?
    },

    nextSpeaker() {
      if (!this.socket) return;
      // bug!
      this.socket.emit('nextSpeaker');
    },

    toggleMenu() {
      (this.$refs['menu'] as Element).classList.toggle('is-active');
    },

    showQueue() {
      (this.$refs['agenda'] as Vue).$el.setAttribute('style', 'display: none;');
      (this.$refs['queue'] as Vue).$el.setAttribute('style', '');
    },

    showAgenda() {
      (this.$refs['queue'] as Vue).$el.setAttribute('style', 'display: none;');
      (this.$refs['agenda'] as Vue).$el.setAttribute('style', '');
    }
  },
  watch: {
    chairs() {
      this.isChair = this.chairs.some(u => {
        return u.ghid === this.user.ghid;
      });
    }
  },
  created() {
    socket.on('state', data => {
      Object.keys(data).forEach(prop => {
        // this is unfortunate
        (this as any)[prop] = (data as any)[prop];
      });
    });

    socket.on('newQueuedSpeaker', data => {
      this.queuedSpeakers.splice(data.position, 0, data.speaker);
    });

    socket.on('deleteQueuedSpeaker', data => {
      let index = this.queuedSpeakers.findIndex(function(queuedSpeaker) {
        return queuedSpeaker.id === data.id;
      });
      this.queuedSpeakers.splice(index, 1);
    });

    socket.on('newCurrentSpeaker', data => {
      this.currentSpeaker = data;
      this.queuedSpeakers.shift();
    });

    socket.on('newAgendaItem', data => {
      this.agenda.push(data);
    });

    socket.on('newCurrentTopic', data => {
      this.currentTopic = data;
    });

    socket.on('reorderAgendaItem', data => {
      this.agenda.splice(data.newIndex, 0, this.agenda.splice(data.oldIndex, 1)[0]);
    });

    socket.on('deleteAgendaItem', data => {
      this.agenda.splice(data.index, 1);
    });

    socket.on('nextAgendaItem', data => {
      this.currentAgendaItem = data;
    });

    socket.on('reorderQueue', data => {
      this.queuedSpeakers.splice(data.newIndex, 0, this.queuedSpeakers.splice(data.oldIndex, 1)[0]);
    });

    socket.on('updateQueuedSpeaker', data => {
      const speaker = this.queuedSpeakers.find(q => q.id === data.id);
      if (!speaker) return;
      speaker.topic = data.topic;
      speaker.type = data.type;
      speaker.user = data.user;
    });
  }
});

// apply template
let App = appTemplate(AppComponent);

export default App;
