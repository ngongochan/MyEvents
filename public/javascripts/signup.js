const {createApp} = Vue;

createApp ({
    data() {
        return {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            title: '',
            phone_number: '',
            student_id: '',
            user_role: '',
            errorMessage: '',
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
    },
    computed: {
        passwordErrors() {
            const errs = [];
            if (this.password.length < 8) errs.push('At least 8 characters');
            if (!/[A-Z]/.test(this.password))errs.push('One uppercase letter');
            if (!/[a-z]/.test(this.password))errs.push('One lowercase letter');
            if (!/[0-9]/.test(this.password)) errs.push('One digit');
            if (!/[!@#$%^&*]/.test(this.password)) errs.push('One special character (!@#$%^&*)');
            return errs;
        }
    },
    methods: {
        submitForm() {
            if(this.password && this.passwordErrors().length) {
                this.errorMessage = 'Please fix your password before submitting.';
                return;
            }
            fetch('/auth/signup/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: this.first_name,
                    lastName: this.last_name,
                    password: this.password,
                    email: this.email,
                    phoneNumber: this.phone_number,
                    studentID: this.student_id,
                    role: this.user_role
                })
                })
                .then((response) => {
                if (!response.ok) {
                    return response.text().then((msg) => {
                        throw new Error(msg);
                    });
                }
                return response.text();
                })
                .then((data) => {
                console.log('Success:', data);
                    this.goToLogIn();
                })
                .catch((err) => {
                console.error('Error:', err);
                this.errorMessage = err.message || "Something went wrong";
                });
        },
        goToLogIn() {
            window.location.href = 'log-in.html';
        }
    }
}).mount('#app');
