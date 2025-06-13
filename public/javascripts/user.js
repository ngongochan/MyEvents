import { formatDate, formatTime } from './utility.js';
const { createApp } = Vue;
createApp({
  data() {
    return {
      searchQuery: '',
      events: [],
      upcomingEvents: [],
      pastEvents: [],
      hostEvents: [],
      hostedEvents: [],
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
      errorPassword: '',
      user: null,
      avatarPreview: null
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
    formatDate,
    formatTime,
    getEventImage(ev) {
      return `/images/event_images/${ev.event_id}.png`;
    },
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
        this.reportDescription = '';
        this.reportSummary = '';
      } else if (which === "Delete") {
        this.showDeleteCf = false;
      } else if (which === "ChangePassword") {
        this.showChangePasword = false;
        this.curPass = '';
        this.newPass = '';
        this.confirmPass = '';
        this.errorPassword = '';
      } else if (which === "EditProfile") {
        this.showEditProfile = false;
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
          this.closeEditModal("Delete");
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
    },
    editProfile() {
      console.log('Saving user:', this.user);

      const formData = new FormData();
      if (this.avatarPreview && this.avatarPreview.file) {
        formData.append('avatar_file', this.avatarPreview.file);
      }

      for (const key in this.user) {
          if (key !== '') {
            formData.append(key, this.user[key]);
        }
      }
      fetch('/users/edit', {
          method: 'POST',
          body: formData
      })
      .then((res) => {
          if (!res.ok) return console.log("Error");
          console.log("User information saved");
          window.location.reload();
          this.closeEditModal('EditProfile');
      })
      .catch((err) => {
          console.error(err);
      });
    },
    onAvatarChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.avatarPreview = {
          file: file,
          url: URL.createObjectURL(file)
        };
      } else {
        this.avatarPreview = null;
      }
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

                  // Attending (future)
            fetch('/users/upcommingevent')
              .then(r => r.json())
              .then((events) => { this.upcomingEvents = events; });

            // Attended (past)
            fetch('/users/pastevent')
              .then(r => r.json())
              .then((events) => { this.pastEvents = events; });

            // Hosting (future)
            fetch('/users/hostevent')
              .then(r => r.json())
              .then((events) => { this.hostEvents = events; });

            // Hosted (past)
            fetch('/users/hostedevent')
              .then(r => r.json())
              .then((events) => { this.hostedEvents = events; });
        });

      fetch('/users/info')
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user info");
        }
        return res.json();
      })
      .then((data) => {
        [this.user] = data;
      })
      .catch((err) => {
        console.error("Error fetching user info:", err);
      });

  }
}).mount('#app');


