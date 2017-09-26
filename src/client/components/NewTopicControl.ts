import Vue from 'vue';

const template = `
<div id=new-topic-control>
  <h2>{{topicName}}</h2>
  <div id=new-topic-form>
    <input
      ref=field
      type=text
      v-model=topicDescription
      @keyup.enter=submitTopic
      @keyup.esc=hide
      placeholder="Short topic description" />
    <button @click=submitTopic class="button-submit">Submit</button>
    <button @click=hide class="button-cancel">Cancel</button>
  </div>
</div>
`;

export const NewTopicControl = Vue.extend({
  template,
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
});
