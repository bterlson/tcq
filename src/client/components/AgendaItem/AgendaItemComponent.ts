import Vue from 'vue';
import template from './AgendaItem.html';
import './AgendaItem.scss';

import AgendaItem from '../../../shared/AgendaItem';

export const AgendaItemComponent = template(
  Vue.extend({
    props: {
      index: {
        default: 0
      },
      item: {
        default: {} as AgendaItem
      }
    },
    methods: {
      emitDelete() {
        this.$emit('delete', this.$props.item);
      }
    }
  })
);
