const { createApp } = Vue;
createApp({
  data() {
    return {
      searchQuery: '',
      events: [
        { id: 1, name: 'Coding Bootcamp', location: 'Room 101', datetime: '2025-05-01 10:00 AM', price: 0 },
        { id: 2, name: 'Music Festival', location: 'Main Hall', datetime: '2025-05-05 06:00 PM', price: 20 },
        { id: 3, name: 'Career Fair', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 },
        { id: 4, name: 'Career Fair 2', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 },
        { id: 5, name: 'Career Fair 3', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 },
        { id: 6, name: 'Career Fair 4', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 },
        { id: 7, name: 'Career Fair', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 },
        { id: 8, name: 'Career Fair', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 },
        { id: 9, name: 'Career Fair', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 },
        { id: 10, name: 'Career Fair', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 },
        { id: 11, name: 'Career Fair', location: 'Hub Central', datetime: '2025-05-10 09:00 AM', price: 0 }
        // Add more event objects here
      ]
    };
  },
  computed: {
    filteredEvents() {
      if (!this.searchQuery) return this.events;
      return this.events.filter(event => 
        event.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
}).mount('#app');