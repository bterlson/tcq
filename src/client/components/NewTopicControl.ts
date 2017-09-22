import Vue from 'vue';

const template = `
<div id=new-topic-control ref=container>
  <div id=new-topic class=active @click=newTopic>
    New Topic
  </div>

  <div id=reply class=active @click=reply>
    Reply
  </div>

  <div id=new-topic-form>
    <input
     ref=field
     type=text
     v-model=topicName
     @keyup.enter=submitTopic
     placeholder="Short topic description" />
    <button @click=submitTopic>Submit</button>
  </div>
</div>
`;

export const NewTopicControl = Vue.extend({
  template,
  data: function() {
    return {
      topicName: ''
    };
  },
  methods: {
    newTopic() {
      let el = this.$refs.container as Element;
      el.classList.add('active');

      let textField = this.$refs.field as HTMLInputElement;
      textField.focus();
    },
    reply() {},
    submitTopic() {
      console.log(this.topicName);
      this.topicName = '';
      console.log(this.topicName);
      let el = this.$refs.container as Element;
      el.classList.remove('active');
    }
  }
});
