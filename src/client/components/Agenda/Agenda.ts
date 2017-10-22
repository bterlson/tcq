import Vue from 'vue';
import template from './Agenda.html';
import './Agenda.scss';
import draggable from 'vuedraggable';
import * as Message from '../../../shared/Messages';
import uuid from 'uuid';
import AgendaItem from '../../../shared/AgendaItem';
import { NewAgendaItemRequest } from '../../../shared/Messages';

export const Agenda = template(
  Vue.extend({
    data: function() {
      return {
        creating: false,
        loading: false,
        newAgendaItem: { name: '' } as NewAgendaItemRequest,
        errorMessage: '',
        timeboxError: ''
      };
    },
    props: {
      socket: {
        default: null as Message.ClientSocket | null
      },
      agenda: {
        default: [] as AgendaItem[]
      }
    },
    components: {
      draggable
    },
    methods: {
      async reorderAgendaItems(e: any) {
        let { newIndex, oldIndex } = e;
        this.toggleLoading();
        try {
          await (this.$root as any).sendRequest(Message.Type.reorderAgendaItemRequest, {
            newIndex,
            oldIndex
          });
        } catch (e) {
          this.agenda.splice(oldIndex, 0, this.agenda.splice(newIndex, 1)[0]);
        } finally {
          this.toggleLoading();
          (this.$refs['drag-container'] as Vue).$el.classList.remove('dragging');
        }
      },

      async deleteAgendaItem(index: number) {
        this.toggleLoading();
        try {
          await (this.$root as any).sendRequest(Message.Type.deleteAgendaItemRequest, {
            index
          });
        } finally {
          this.toggleLoading();
        }
      },
      dragStart() {
        (this.$refs['drag-container'] as Vue).$el.classList.add('dragging');
      },

      async createNewAgendaItem() {
        if (!this.newAgendaItem.name) return;
        if (!this.socket) return;

        if (this.newAgendaItem.timebox && !this.newAgendaItem.timebox.match(/^\d{0,3}$/)) {
          this.timeboxError = '???';
          return;
        } else {
          this.timeboxError = '';
        }

        let app = this.$root; // can't be typed unless I can extract the instance type from the constructor
        (this.$refs['create-button'] as Element).classList.toggle('is-loading');
        try {
          await (app as any).sendRequest(Message.Type.newAgendaItemRequest, this.newAgendaItem);
          this.cancelForm();
        } catch (e) {
          this.errorMessage = e.message;
        } finally {
          (this.$refs['create-button'] as Element).classList.toggle('is-loading');
          this.toggleLoading();
        }
      },
      showForm() {
        this.creating = true;
        this.newAgendaItem.ghUsername = this.$root.$data.user.ghUsername;
        Vue.nextTick(() => {
          (this.$refs['item-name-input'] as HTMLInputElement).focus();
        });
      },
      cancelForm() {
        this.errorMessage = '';
        this.creating = false;
        this.newAgendaItem = { name: '' } as any;
      },
      toggleLoading() {
        this.loading = !this.loading;
        console.log('set loading to ' + this.loading);
      }
    }
  })
);
