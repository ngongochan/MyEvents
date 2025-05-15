const { createApp } = Vue;
const events = [
        { id: 1, name: 'Coding Bootcamp', category: 'Networking events', location: 'Room 101', datetime: '2025-05-01 10:00 AM', price: 0 },
        { id: 2, name: 'Music Festival', category: 'Industry nights', location: 'Main Hall', datetime: '2025-05-05 06:00 PM', price: 20 },
        { id: 3, name: 'Career Fair', category: 'Academic workshops', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 },
        { id: 4, name: 'Resume & Interview Prep', category: 'Career workshops', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 }
        // Add more event objects here
];
const grid = document.querySelector('#app');
if (grid) {
  createApp({
    data() {
      return {
        searchQuery: '',
        events
      };
    },
    computed: {
      filteredEvents() {
        if (!this.searchQuery) return this.events;
        return this.events.filter(event => 
          event.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },

      grouped() {
        const order = [
          'Trending events',
          'Networking events',
          'Industry nights',
          'Academic workshops',
          'Career workshops'
        ]

        const out = {}
        order.forEach(cat => {out[cat] = []})
        this.filteredEvents.forEach(e => {
          if (out[e.category]) {
            out[e.category].push(e)
          } else {
            out[e.category] = [e]
          }
        })
        return out
      }
    }
  }).mount('#app');
}

const detail = document.getElementById('event-detail');
if (detail) {
  createApp({
    data() {
      return {
        event: null
      };
    },
    mounted() {
      const params = new URLSearchParams(window.location.search);
      const id = parseInt(params.get('id'), 10);
      this.event = events.find(e => e.id === id) || null;
    }
  }).mount('#event-detail')
}

const ticket = document.getElementById('ticket-card');
if (ticket) {
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
}
