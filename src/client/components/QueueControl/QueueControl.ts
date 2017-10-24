import Vue from 'vue';
import template from './QueueControl.html';
import { QueuedSpeaker } from '../QueuedSpeaker/QueuedSpeaker';
import { CurrentSpeaker } from '../CurrentSpeaker/CurrentSpeaker';
import { SpeakerControls } from '../SpeakerControls/SpeakerControls';
import AgendaItem from '../../../shared/AgendaItem';
import Speaker from '../../../shared/Speaker';
import * as Message from '../../../shared/Messages';
import uuid from 'uuid';

export const QueueControl = template(
  Vue.extend({
    props: {
      currentAgendaItem: {
        default: undefined as AgendaItem | undefined
      },
      currentTopic: {
        default: undefined as Speaker | undefined
      },
      currentSpeaker: {
        default: undefined as Speaker | undefined
      },
      queuedSpeakers: {
        default: [] as Speaker[]
      },
      timeboxEnd: {
        default: undefined as Date | string | undefined
      },
      timeboxSecondsLeft: {
        default: undefined as number | undefined
      },
      socket: {
        default: null as Message.ClientSocket | null
      }
    },
    components: {
      QueuedSpeaker,
      CurrentSpeaker,
      SpeakerControls
    },
    methods: {
      async nextAgendaItem() {
        await (this.$root as any).sendRequest(Message.Type.nextAgendaItemRequest, {
          currentItemId: this.currentAgendaItem ? this.currentAgendaItem.id : undefined
        } as Message.NextAgendaItemRequest);
      }
    }
  })
);
