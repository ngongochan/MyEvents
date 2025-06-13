const { createApp } = Vue;

createApp({
  data() {
    return {
      searchQuery: '',
      events: [],
      email: '',
      isLoggedIn: false,
      showErrorReport: false,
      reportSummary: '',
      reportDescription: ''
    };
  },
  computed: {
  },
  methods: {
    onSubmitSearch() {
      const q = this.searchQuery.trim();
      if (q) {
        window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
      }
    },
    signOut() {
        fetch('/auth/signout').then(() => {
          sessionStorage.clear();
          window.location.href = '/';
        });
    },
    closeEditModal(which) {
      if (which === "ErrorReport") {
        this.showErrorReport = false;
      }
    },
    saveReport() {
      fetch('/users/report', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: this.reportSummary,
          detail: this.reportDescription
        })
      })
      .then((res) => {
        if (!res.ok) {
          window.location.href = '/error';
        }
        this.closeEditModal("ErrorReport");
      });
    },

  },
  mounted() {
    fetch('/api/session-status')
        .then((res) => res.json())
        .then(({ isLoggedIn, email }) => {
            this.isLoggedIn = isLoggedIn;
            if (!isLoggedIn) {
              window.location.href = '/error';
            }
            this.email = email || '';
        });
  }
}).mount('#app');
