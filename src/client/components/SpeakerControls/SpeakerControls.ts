import Vue from 'vue';
import { TopicTypes } from '../../../shared/Speaker';
import template from './SpeakerControls.html';
import * as Message from '../../../shared/Messages';
import uuid from 'uuid';
import './SpeakerControls.scss';

export const SpeakerControls = template(
  Vue.extend({
    props: {
      currentTopic: {
        default: undefined
      }
    },
    data: function() {
      return {
        creating: false,
        topicType: null as TopicTypes | null,
        topicDescription: ''
      };
    },
    methods: {
      cancel: function() {
        this.creating = false;
      },

      showTopicForm(type: TopicTypes) {
        this.creating = true;
        this.topicType = type;
        this.topicDescription = '';
        setTimeout(() => {
          (this.$refs['field'] as HTMLInputElement).focus();
        }, 1);
      },

      async enqueue() {
        await (this.$root as any).sendRequest(Message.Type.newQueuedSpeakerRequest, {
          id: uuid(),
          topic: this.topicDescription,
          type: this.topicType
        } as Message.NewQueuedSpeakerRequest);
        this.cancel();
      },

      topicHeader() {
        switch (this.topicType) {
          case 'poo':
            return 'Point of Order';
          case 'question':
            return 'Clarifying Question';
          case 'topic':
            return 'New Topic';
          case 'reply':
            return 'Reply to ' + (this.$root as any).currentTopic.topic;
        }
      }
    }
  })
);
