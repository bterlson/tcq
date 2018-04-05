import Vue from 'vue';
import template from './Agenda.html';
import './Agenda.scss';
import draggable from 'vuedraggable';
import * as Message from '../../../shared/Messages';
import uuid from 'uuid';
import AgendaItem from '../../../shared/AgendaItem';
import { NewAgendaItemRequest } from '../../../shared/Messages';
import { AgendaItemComponent } from '../AgendaItem/AgendaItemComponent';
import { request } from '../../ClientSocket';

export const Agenda = template(
  Vue.extend({
    data: function () {
      return {
        creating: false,
        loading: false,
        newAgendaItem: { name: '' } as NewAgendaItemRequest,
        errorMessage: '',
        timeboxError: ''
      };
    },
    props: {
      agenda: {
        default: [] as AgendaItem[]
      }
    },
    components: {
      draggable,
      agendaItem: AgendaItemComponent
    },
    methods: {
      async reorderAgendaItems(e: any) {
        let { newIndex, oldIndex } = e;
        this.loading = true;
        try {
          await request('reorderAgendaItemRequest', {
            newIndex,
            oldIndex
          });
        } catch (e) {
          this.agenda.splice(oldIndex, 0, this.agenda.splice(newIndex, 1)[0]);
        } finally {
          this.loading = false;
          (this.$refs['drag-container'] as Vue).$el.classList.remove('dragging');
        }
      },

      async deleteAgendaItem(index: number) {
        this.loading = true;
        try {
          await request('deleteAgendaItemRequest', {
            index
          });
        } finally {
          this.loading = false;
        }
      },
      dragStart() {
        (this.$refs['drag-container'] as Vue).$el.classList.add('dragging');
      },

      async createNewAgendaItem() {
        if (!this.newAgendaItem.name) return;

        if (this.newAgendaItem.timebox && !this.newAgendaItem.timebox.match(/^\d{0,3}$/)) {
          this.timeboxError = '???';
          return;
        } else {
          this.timeboxError = '';
        }

        (this.$refs['create-button'] as Element).classList.toggle('is-loading');
        try {
          await request('newAgendaItemRequest', this.newAgendaItem);
          this.cancelForm();
        } catch (e) {
          this.errorMessage = e.message;
        } finally {
          (this.$refs['create-button'] as Element).classList.toggle('is-loading');
          this.loading = false;
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
      }
    }
  })
);
