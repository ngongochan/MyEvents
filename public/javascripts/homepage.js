// const { createApp } = Vue;
// const events = [
//         { id: 1, name: 'Coding Bootcamp', category: 'Networking events', location: 'Room 101', datetime: '2025-05-01 10:00 AM', price: 0 },
//         { id: 2, name: 'Music Festival', category: 'Industry nights', location: 'Main Hall', datetime: '2025-05-05 06:00 PM', price: 20 },
//         { id: 3, name: 'Career Fair', category: 'Academic workshops', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 },
//         { id: 4, name: 'Resume & Interview Prep', category: 'Career workshops', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 }
//         // Add more event objects here
// ];
// const grid = document.querySelector('#app');
// if (grid) {
//   createApp({
//     data() {
//       return {
//         searchQuery: '',
//         events
//       };
//     },
//     computed: {
//       filteredEvents() {
//         if (!this.searchQuery) return this.events;
//         return this.events.filter(event =>
//           event.name.toLowerCase().includes(this.searchQuery.toLowerCase())
//         );
//       },

//       grouped() {
//         const order = [
//           'Trending events',
//           'Networking events',
//           'Industry nights',
//           'Academic workshops',
//           'Career workshops'
//         ]

//         const out = {}
//         order.forEach(cat => {out[cat] = []})
//         this.filteredEvents.forEach(e => {
//           if (out[e.category]) {
//             out[e.category].push(e)
//           } else {
//             out[e.category] = [e]
//           }
//         })
//         return out
//       }
//     }
//   }).mount('#app');
// }

// const detail = document.getElementById('event-detail');
// if (detail) {
//   createApp({
//     data() {
//       return {
//         event: null
//       };
//     },
//     mounted() {
//       const params = new URLSearchParams(window.location.search);
//       const id = parseInt(params.get('id'), 10);
//       this.event = events.find(e => e.id === id) || null;
//     }
//   }).mount('#event-detail')
// }

// const ticket = document.getElementById('ticket-card');
// if (ticket) {
//   createApp({
//     data() {
//         return {
//             quantity: 1
//         };
//     },
//     methods: {
//       increment() {
//           this.quantity++;
//       },
//       decrement() {
//           if (this.quantity > 1) this.quantity--;
//       },
//       purchase() {
//           alert(`Purchasing ${this.quantity} general admission ticket(s)!`);
//       }
//     }
//   }).mount('#ticket-card');
// }

import { formatDate, formatTime } from './utility.js';

const { createApp } = Vue;

createApp({
  data() {
    return {
      events: [],
      email: '',
      isLoggedIn: false
    };
  },
  computed: {
    networkingEvent() {
      return this.events.filter(e => e.event_type === 'networking');
    },
    entertainEvent() {
      return this.events.filter(e => e.event_type === 'entertain');
    },
    workshopEvent() {
      return this.events.filter(e => e.event_type === 'workshop');
    },
    culturalEvent() {
      return this.events.filter(e => e.event_type === 'cultural');
    }
  },
  mounted() {
    fetch('/all-events')
    .then(res => res.json())
    .then(js => {
      this.events = js;
    });
    fetch('/api/session-status')
        .then((res) => res.json())
        .then(({ isLoggedIn, email }) => {
            this.isLoggedIn = isLoggedIn;
            this.email = email || '';
        });
  }
}).mount('#app');

function renderCards(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  list.forEach(e => {
    const detailUrl = `/event.html?event_id=${e.event_id}`;
    const date = formatDate(e.event_date);
    const time = formatTime(e.start_time);
    const imgTag = e.image_name
      ? `<img src="/images/event_images/${e.image_name}"
              alt="${e.title}"
              class="event-img">`
      : `<div class="event-img"></div>`;
    container.innerHTML += `
    <a href="${detailUrl}" class="event-card-link">
      <div class="event-card">
        ${imgTag}
        <h3>${e.title}</h3>
        <p>${e.event_location}</p>
        <p>${date} ${time}</p>
        <p>$${e.price}</p>
      </div>
    </a>
    `;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch(`/all-events`)
    .then(res => res.json())
    .then(events => {
      // split by type
      const networking = events.filter(e => e.event_type.startsWith('networking'));
      const entertain = events.filter(e => e.event_type.startsWith('entertain'));
      const workshop = events.filter(e => e.event_type.startsWith('workshop'));
      const cultural = events.filter(e => e.event_type.startsWith('cultural'));

      renderCards(networking, 'networking');
      renderCards(entertain, 'entertain');
      renderCards(workshop, 'workshop');
      renderCards(cultural, 'cultural');
    })
    .catch(console.error);
});

