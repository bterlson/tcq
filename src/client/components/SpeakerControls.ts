import Vue from 'vue';
import { TopicTypes } from '../../shared/Speaker';
import { NewTopicControl } from './NewTopicControl';

const template = `
  <div id="speaker-controls">
    <div class=button id=new-topic @click="showNewTopic('topic')">New Topic</div>
    <div class=button id=reply @click="showNewTopic('reply')">Reply</div>
    <div class=button id=speaker-question @click="showNewTopic('clarify')">Clarifying Question</div>
    <div class=button id=speaker-poo @click="showNewTopic('poo')">Point of Order</div>
    <new-topic-control :topicType="this.topicType" :currentTopic=currentTopic  v-if="this.creatingTopic" @cancel=cancel @new-topic=newTopic></new-topic-control>
  </div>`;

export const SpeakerControls = Vue.extend({
  props: {
    currentTopic: ''
  },
  data: function() {
    return {
      creatingTopic: false,
      topicType: null as TopicTypes | null
    };
  },
  template,
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
});
