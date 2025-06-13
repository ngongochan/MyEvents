import { formatDate, formatTime } from './utility.js';
const { createApp } = Vue;

createApp({
  data() {
    return {
      searchQuery: '',
      events: [],
      email: '',
      isLoggedIn: false,
      categories: [
        { key: 'networking', label: 'Networking events' },
        { key: 'entertainment', label: 'Entertainment events' },
        { key: 'workshop', label: 'Workshops' },
        { key: 'cultural', label: 'Cultural events' },
        { key: 'Others', label: 'Others' }
      ]
    };
  },
  computed: {
    groupedEvents() {
      return this.categories.map(cat => ({
        key: cat.key,
        label: cat.label,
        items: this.events.filter(e => e.event_type.toLowerCase() === cat.key.toLowerCase())
      }));
    },
    filteredGroups() {
      return this.groupedEvents.filter(group => group.items.length > 0);
    }
  },
  methods: {
    formatDate,
    formatTime,
    onSubmitSearch() {
      const q = this.searchQuery.trim();
      if (q) {
        window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
      }
    }
  },
  mounted() {
    fetch('/all-events')
        .then((res) => res.json())
        .then((js) => {
          this.events = js;
        }).catch((err) => console.error('Failed to load events:', err));
    fetch('/api/session-status')
        .then((res) => res.json())
        .then(({ isLoggedIn, email }) => {
            this.isLoggedIn = isLoggedIn;
            this.email = email || '';
        });
  }
}).mount('#app');
