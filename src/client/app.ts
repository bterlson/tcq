import Vue from "vue";
import { QueuedSpeaker } from "./components/QueuedSpeaker";
import { CurrentSpeaker } from "./components/CurrentSpeaker";

const currentSpeaker = {
    firstName: "Brian",
    lastName: "Terlson",
    organization: "Microsoft"
};

const queuedSpeakers = [
    { firstName: "Daniel", lastName: "Rosenwasser", organization: "Microsoft" },
    { firstName: "Yehuda", lastName: "Katz", organization: "Tilde" },
    { firstName: "David", lastName: "Herman", organization: "LinkedIn" },
    { firstName: "aaa", lastName: "", organization: "" },
    { firstName: "bbb", lastName: "", organization: "" },
    { firstName: "aaa", lastName: "", organization: "" },
    { firstName: "bbb", lastName: "", organization: "" },
    { firstName: "aaa", lastName: "", organization: "" },
    { firstName: "bbb", lastName: "", organization: "" },
].map(
    (speaker, id) => ({ ...speaker, id })
);

let app = new Vue({
    el: '#app',
    data: {
        currentSpeaker,
        queuedSpeakers,
    },
    mounted() {
        console.log('you mounted, good for you');
    },
    components: {
        QueuedSpeaker,
        CurrentSpeaker,
    }
});

(window as any).app = app;