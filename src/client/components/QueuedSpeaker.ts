import Vue from "vue";

export const QueuedSpeaker = Vue.extend({
    props: {
        firstName: String,
        lastName: String,
        organization: String,
    },
    template: `
        <div class="queue-item">
            <span>{{firstName}} {{lastName}}</span>{{displayedOrg}}
        </div>
    `,
    computed: {
        displayedOrg(): string {
            return this.organization ? ` (${this.organization})` : "";
        }
    }
});