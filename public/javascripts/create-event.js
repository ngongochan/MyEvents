const {createApp} = Vue;

createApp({
    data() {
        return {
            eventTypes: ['Entertainment', 'Networking', 'Culture', 'Workshop'],
            selectedType: ''
        }
    }
}).mount('#event-type');