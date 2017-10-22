import Vue from 'vue';
import template from './NewTopicControl.html';

export const NewTopicControl = template(
  Vue.extend({
    props: {
      topicType: '',
      currentTopic: ''
    },
    data: function() {
      return {
        topicDescription: ''
      };
    },
    methods: {
      submitTopic() {
        this.$emit('new-topic', { type: this.$props.topicType, topic: this.topicDescription });
        this.hide();
      },
      hide() {
        this.$emit('cancel');
      }
    },
    computed: {
      topicName(): string {
        // very weird errors if you remove this return annotation
        let t = this.$props.topicType;

        switch (t) {
          case 'poo':
            return 'Point of Order';
          case 'question':
            return 'Clarifying Question about ' + this.$props.currentTopic;
          case 'topic':
            return 'New Topic';
          case 'reply':
            return 'Reply to ' + this.$props.currentTopic;
        }

        return 'Unknown topic type'; // Very strange TS errors if you comment this return.
      }
    }
  })
);
