import Vue from 'vue';
import './new.scss';
import { NewMeeting } from '../../components/NewMeeting/NewMeeting';
import { JoinMeeting } from '../../components/JoinMeeting/JoinMeeting';

new NewMeeting({ el: '#new-meeting' });
new JoinMeeting({ el: '#join-meeting' });
