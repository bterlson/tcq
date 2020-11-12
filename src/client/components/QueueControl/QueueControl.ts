import Vue from 'vue';
import template from './QueueControl.html';
import { QueuedSpeaker } from '../QueuedSpeaker/QueuedSpeaker';
import { CurrentSpeaker } from '../CurrentSpeaker/CurrentSpeaker';
import { SpeakerControls } from '../SpeakerControls/SpeakerControls';
import { TempCheck } from '../TempCheck/TempCheck';
import AgendaItem from '../../../shared/AgendaItem';
import Speaker from '../../../shared/Speaker';
import Reaction from '../../../shared/Reaction';
import * as Message from '../../../shared/Messages';
import uuid from 'uuid';
import { request } from '../../ClientSocket';

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
      },
      reactions: {
        default: undefined as Reaction[] | undefined
      },
      trackTemperature: {
        default: false as boolean
      }
    },
    components: {
      QueuedSpeaker,
      CurrentSpeaker,
      SpeakerControls,
      TempCheck
    },
    methods: {
      async nextAgendaItem() {
        await request('nextAgendaItemRequest', {
          currentItemId: this.currentAgendaItem ? this.currentAgendaItem.id : undefined
        } as Message.NextAgendaItemRequest);
      },
      async trackTemp() {
        await request('trackTemperatureRequest', {
          track: true
        } as Message.TrackTemperatureRequest);
      },
      async stopTemp() {
        await request('trackTemperatureRequest', {
          track: false
        } as Message.TrackTemperatureRequest);
      }
    }
  })
);
