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
      reportDescription: '',
      showDeleteCf: '',
      showChangePasword: false,
      curPass: '',
      newPass: '',
      confirmPass: '',
      showEditProfile: false,
      errorPassword: ''
    };
  },
  computed: {
    passwordErrors() {
        const errs = [];
        if (this.newPass.length < 8) errs.push('At least 8 characters');
        if (!/[A-Z]/.test(this.newPass)) errs.push('One uppercase letter');
        if (!/[a-z]/.test(this.newPass)) errs.push('One lowercase letter');
        if (!/[0-9]/.test(this.newPass)) errs.push('One digit');
        if (!/[!@#$%^&*.]/.test(this.newPass)) errs.push('One special character (!@#$%^&*.)');
        return errs;
    },
    passwordMatch() {
        return this.newPass && this.confirmPass === this.newPass;
    }
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
      } else if (which === "Delete") {
        this.showDeleteCf = false;
      } else if (which === "ChangePassword") {
        this.showChangePasword = false;
        this.curPass = '';
        this.newPass = '';
        this.confirmPass = '';
        this.errorPassword = '';
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
    deleteAccount() {
      fetch('/auth/signout').then(() => {
        fetch('/users/delete-account')
        .then((res) => {
          sessionStorage.clear();
          window.location.href = '/';
        });
      });

    },
    changePassword() {
    if (!this.passwordMatch) {
      return;
    }
    if (this.curPass === this.newPass) {
      this.errorPassword = "New password is similar to current password entered!";
      return;
    }
    fetch('/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cur: this.curPass,
        new: this.newPass
      })
    })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to change password.');
      return res.json();
    })
    .then((data) => {
      if (data.errorMessage) {
        this.errorPassword = data.errorMessage;
      }
      this.closeEditModal("ChangePassword");
    })
    .catch((err) => {
      console.error("Error:", err);
      this.errorPassword = err.message || "An unexpected error occurred.";
    });
  }

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
