import { formatDate, formatTime } from './utility.js';
const { createApp } = Vue;

createApp({
    data() {
        return {
            event: null,
            quantity: 1,
            email: '',
            isLoggedIn: false
        };
    },

    mounted() {
        // initDetailPage()
        const params = new URLSearchParams(window.location.search);
        const id = params.get('event_id');
        if (!id) {
            return window.location.replace('/');
        }
        fetch(`/event/detail?event_id=${encodeURIComponent(id)}`)
        .then(res => res.json())
        .then(rows => {
            [this.event] = rows;
            this.initTicketCard();
        })
        .catch(console.error);
        fetch('/api/session-status')
        .then((res) => res.json())
        .then(({ isLoggedIn, email }) => {
            this.isLoggedIn = isLoggedIn;
            this.email = email || '';
        });
    },

    methods: {
        formatDate,
        formatTime,
        increment() {
            this.quantity++;
        },
        decrement() {
            if (this.quantity > 1) this.quantity--;
        },
        purchase() {
            alert(`Purchasing ${this.quantity} ticket(s)!`);
        }
    }
}).mount('#app');