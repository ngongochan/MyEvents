const { createApp } = Vue;

createApp({
  data() {
    return {
      events: [],
      email: '',
      user_table: true,
      event_table: true,
      showUserModal: false,
      showEventModal: false,
      showInsertUserModal: false,
      selectedUser: null,
      selectedEvent: null,
      email_search: '',
      email_searched: '',
      title_search: '',
      title_searched: '',
      avatarPreview: null,
      adjust_message: '',
      error_message: '',
      newUser: {
        first_name: '',
        last_name: '',
        title: 'none',
        email: '',
        student_id: '',
        phone_number: '',
        user_role: 'guest',
        avatar: 'default_avatar.png'
      }
    };
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.email_searched = urlParams.get('email') || '';
    this.title_searched = urlParams.get('title') || '';
  },
  methods: {
    user_table_change() {
      this.user_table = !this.user_table;
    },
    event_table_change() {
      this.event_table = !this.event_table;
    },
    searchUser() {
      const params = new URLSearchParams();
      if (this.email_search) {
        this.email_searched = this.email_search;
        params.append('email', this.email_searched);
      }
      if (this.title_searched) {
        params.append('title', this.title_searched);
      }
      window.location.href = `/admin/dashboard?${params.toString()}`;
    },
    searchEvent() {
      const params = new URLSearchParams();
      if (this.email_searched) {
        params.append('email', this.email_searched);
      }
      if (this.title_search) {
        this.title_searched = this.title_search;
        params.append('title', this.title_searched);
      }
      window.location.href = `/admin/dashboard?${params.toString()}`;
    },
    showAllEvent() {
      const params = new URLSearchParams();
      if (this.email_searched) {
        params.append('email', this.email_searched);
      }
      window.location.href = `/admin/dashboard?${params.toString()}`;
    },
    showAllUser() {
      const params = new URLSearchParams();
      if (this.title_searched) {
        params.append('title', this.title_searched);
      }
      window.location.href = `/admin/dashboard?${params.toString()}`;
    },
    deleteUser() {
      fetch('/admin/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: this.selectedUser.user_id })
      })
      .then((res) => {
        if (!res.ok) return res.text().then((t) => Promise.reject(t));
        this.adjust_message = "Deleted user!";
        window.location.reload();
        this.closeEditModal('userEdit');
        return res.json();
      })
      .catch((err) => {
        console.error(err);
      });
    },
    openEditModal(user) {
      console.log('Opening edit user  modal');
      this.selectedUser = JSON.parse(JSON.stringify(user));
      this.avatarPreview = null;
      this.showUserModal = true;
    },
    closeEditModal(which) {
      if (which === 'userEdit') {
        this.showUserModal = false;
        this.selectedUser = null;
      } else if (which === 'userInsert') {
        this.showInsertUserModal = false;
        this.newUser = {
        first_name: '',
        last_name: '',
        title: '',
        email: '',
        user_password: '',
        student_id: '',
        phone_number: '',
        user_role: 'guest',
        avatar: 'default_avatar.png'
        };
      } else if (which === 'eventEdit') {
        this.showEventModal = false;
        this.selectedEvent = null;
      }
    },
    saveUser() {
      console.log('Saving user:', this.selectedUser);

       const formData = new FormData();
      if (this.avatarPreview && this.avatarPreview.file) {
        formData.append('avatar_file', this.avatarPreview.file);
      }

      for (const key in this.selectedUser) {
          if (key !== '') {
            formData.append(key, this.selectedUser[key]);
        }
      }
      fetch('/admin/user/adjust', {
          method: 'POST',
          body: formData
      })
      .then((res) => {
          if (!res.ok) return res.text().then((t) => Promise.reject(t));
          console.log("User information saved");
          this.adjust_message = "Information updated!";
          window.location.reload();
          this.closeEditModal('userEdit');
          return res.json();
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
    },
    openInsertModal() {
      console.log('Opening insert user modal');
      this.showInsertUserModal = true;
    },
    addUser() {
      console.log('Adding new user');

       const formData = new FormData();
      if (this.avatarPreview && this.avatarPreview.file) {
        formData.append('avatar_file', this.avatarPreview.file);
      }

      for (const key in this.newUser) {
          if (key !== '') {
            formData.append(key, this.newUser[key]);
        }
      }
      fetch('/admin/user/insert', {
          method: 'POST',
          body: formData
      })
      .then((res) => {
          if (!res.ok) return res.text().then((t) => Promise.reject(t));
          console.log("User information added");
          this.adjust_message = "User added";
          this.closeEditModal('userInsert');
          window.location.reload();
          return res.json();
      })
      .catch((err) => {
          console.error(err);
      });
    },
    openEditEventModal(event) {
      this.selectedEvent = JSON.parse(JSON.stringify(event));
      this.selectedEvent.event_date = new Date(event.event_date);
      this.showEventModal = true;
    },
    saveEvent() {
      fetch('/admin/event/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.selectedEvent)
      })
      .then((res) => {
        if (!res.ok) return res.text().then((t) => Promise.reject(t));
        console.log("Adjusted Events!");
        this.adjust_message = "Adjusted Event";
        this.closeEditModal('eventEdit');
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      });
    },
    deleteEvent() {
      fetch('/admin/event/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: this.selectedEvent.event_id
        })
      })
      .then((res) => {
        if (!res.ok) return res.text().then((t) => Promise.reject(t));
        console.log("Deleted event!");
        this.adjust_message = "Deleted Event";
        this.closeEditModal('eventEdit');
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      });
    },
    addEvent() {
      window.location.replace("/create-event.html");
    }
  }
})
.mount('#app');

