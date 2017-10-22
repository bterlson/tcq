import Vue from 'vue';
import template from './JoinMeeting.html';
import axios from 'axios';
import User from '../../../shared/User';

export const JoinMeeting = template(
  Vue.extend({
    data: function() {
      return {
        meetingId: '',
        helpText: '4 characters',
        hasError: false
      };
    },

    methods: {
      async joinMeeting() {
        if (this.meetingId.length !== 4) {
          this.helpText = 'To restate: must be 4 characters';
          this.hasError = true;
          return;
        }

        try {
          let res = await axios.head('/meeting/' + this.meetingId);
        } catch (e) {
          if (e.response && e.response.status === 404) {
            this.helpText = 'Meeting not found';
            this.hasError = true;
            return;
          }
        }

        document.location.href = '/meeting/' + this.meetingId;
      }
    }
  })
);
