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
        .then((res) => res.json())
        .then((rows) => {
            [this.event] = rows;
            this.initTicketCard();
        });
        fetch('/api/session-status')
        .then((res) => res.json())
        .then(({ isLoggedIn, email }) => {
            this.isLoggedIn = isLoggedIn;
            this.email = email || '';
        });
        return null;
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
        async purchase() {
            if (!this.isLoggedIn) {
                alert('Please log in to purchase tickets!');
                return;
            }
            try {
                const ticketResult = await fetch('/event/ticket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event_id: this.event.event_id,
                        quantity: this.quantity,
                        price: this.event.price * this.quantity
                    })
                });
                if (!ticketResult.ok) {
                    alert('Not enough tickets or error in purchase!');
                    return;
                }
                const emailResult = await fetch('/mail/confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventTitle: this.event.title
                    })
                });
                if (!emailResult.ok) {
                    alert('Purchase complete, but email failed to send.');
                    return;
                }

                alert('Purchase successful! Check your email for confirmation.');
            } catch (err) {
                alert('Something went wrong. Please try again.');
                console.error(err);
            }
        }
    }
}).mount('#app');
