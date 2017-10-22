import Vue from 'vue';
import template from './AgendaItem.html';
import './AgendaItem.scss';

import AgendaItem from '../../../shared/AgendaItem';

export const AgendaItem = template(
  Vue.extend({
    props: {
      index: 0,
      item: {} as AgendaItem
    }
  })
);
