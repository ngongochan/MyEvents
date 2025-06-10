const { createApp } = Vue;

createApp({
  data() {
    return {
      events: [],
      email: '',
      isLoggedIn: false
    };
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

