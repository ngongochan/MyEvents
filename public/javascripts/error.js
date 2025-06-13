const { createApp } = Vue;

createApp({
  data() {
    return {
      events: [],
      email: '',
      isLoggedIn: false
    };
  },
  methods: {
    onSubmitSearch() {
            const q = this.searchQuery.trim();
            if (q) {
                window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
            }
        }
  },
  mounted() {
    fetch('/api/session-status')
        .then((res) => res.json())
        .then(({ isLoggedIn, email }) => {
            this.isLoggedIn = isLoggedIn;
            this.email = email || '';
        });
  }
})
.mount('#app');

