import Vue from "vue";

export const CurrentSpeaker = Vue.extend({
    props: ["speaker"],
    template: `
    <div v-if="speaker" id="current-speaker">
        <h2>Current speaker</h2>
        <div>{{speaker.firstName}} {{speaker.lastName}}</div>
        <div v-show="speaker.organization">{{speaker.organization}}</div>
    </div>
    <div v-else>
        <h2>No active speaker</h2>
    </div>`
})