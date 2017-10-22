import Vue from 'vue';
import template from './NewMeeting.html';
import axios from 'axios';

export const NewMeeting = template(
  Vue.extend({
    data() {
      return {
        chairs: '',
        errorMessage: ''
      };
    },
    created() {
      this.chairs = (window as any).user.ghUsername; // populated via router.js
    },
    methods: {
      async newMeeting() {
        let res;

        try {
          res = await axios.post('/meetings', {
            chairs: this.chairs
          });
        } catch (e) {
          this.errorMessage = e.response.data.message;
          return;
        }
        let { id } = res.data;
        document.location.href = '/meeting/' + id;
      }
    }
  })
);
