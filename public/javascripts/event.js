const { createApp } = Vue;
createApp({
    data() {
        return {
            quantity: 1
        };
    },
    methods: {
        increment() {
            this.quantity++;
        },
        decrement() {
            if (this.quantity > 1) this.quantity--;
        },
        purchase() {
            alert(`Purchasing ${this.quantity} general admission ticket(s)!`);
        }
    }
}).mount('#ticket-card');