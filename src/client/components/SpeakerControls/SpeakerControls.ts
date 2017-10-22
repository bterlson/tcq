import Vue from 'vue';
import { TopicTypes } from '../../../shared/Speaker';
import { NewTopicControl } from '../NewTopicControl/NewTopicControl';
import template from './SpeakerControls.html';

export const SpeakerControls = template(
  Vue.extend({
    props: {
      currentTopic: ''
    },
    data: function() {
      return {
        creatingTopic: false,
        topicType: null as TopicTypes | null
      };
    },
    methods: {
      showNewTopic(type: TopicTypes) {
        this.creatingTopic = true;
        this.topicType = type;
      },
      cancel: function() {
        this.creatingTopic = false;
      },
      newTopic: function(topic: string) {
        this.$emit('new-topic', topic);
      }
    },
    components: {
      NewTopicControl
    }
  })
);
