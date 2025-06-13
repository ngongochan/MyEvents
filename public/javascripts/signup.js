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
            confirm_password: '',
            isLoggedIn: false,
            passwordStrength: null,
            passwordIndication: ''
        };
    },
    mounted() {
        fetch('/api/session-status')
        .then((res) => res.json())
        .then(({ isLoggedIn, email }) => {
            this.isLoggedIn = isLoggedIn;
            this.email = email || '';
            if (this.isLoggedIn) {
              window.location.href = '/error';
            }
        });
    },
    computed: {
        // 1) Pure function, no side-effects, no recursive calls
        passwordErrors() {
            const errs = [];
            if (this.password.length < 8) errs.push('At least 8 characters');
            if (!/[A-Z]/.test(this.password)) errs.push('One uppercase letter');
            if (!/[a-z]/.test(this.password)) errs.push('One lowercase letter');
            if (!/[0-9]/.test(this.password)) errs.push('One digit');
            if (!/[!@#$%^&*.]/.test(this.password)) errs.push('One special character (!@#$%^&*.)');
            return errs;
        },

        // 2) New pure computed for strength
        passwordCharsetSize() {
            let R = 0;
            if (/[A-Z]/.test(this.password)) R += 26;
            if (/[a-z]/.test(this.password)) R += 26;
            if (/[0-9]/.test(this.password)) R += 10;
            if (/[!@#$%^&*.]/.test(this.password)) R += 9;
            return R;
        },

        // 3) Strength of password range(0,10)
        passwordStrengthComputed() {
            const L = this.password.length;
            const R = this.passwordCharsetSize;
            const strength = (L > 0 && R > 0)
            ? Math.round(((L * Math.log2(R)) / 90) * 100)
            : null;
            if (strength >= 100) {
                return 100;
            }
            return strength;
        },

        strengthPercent() {
            if(this.passwordCharsetSize) {
                const percent = this.passwordStrengthComputed;
                if (percent > 100) {
                    return 100;
                }
                return Math.round(percent);
            }
            return 0;
        },
        strengthColor() {
            const percent = this.strengthPercent;
            if (percent < 30) return '#e74c3c';
            if (percent < 70) return '#f1c40f';
            return '#2ecc71';
        },
        strengthMessage() {
            const percent = this.strengthPercent;
            if (percent < 30) return "Weak Password";
            if (percent < 70) return "Moderate password";
            return "Strong Password";
        },
        passwordMatch() {
            return this.password && this.password === this.confirm_password;
        }
    },
    methods: {
        async submitForm() {
            if(this.password && this.passwordErrors.length) {
                this.errorMessage = 'Please fix your password before submitting.';
                return;
            }
            const thisEmail = this.email;
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
                .then(async (data) => {
                    console.log('Success:', data);
                    await this.sendMail(thisEmail);
                    this.goToLogIn();
                })
                .catch((err) => {
                console.error('Error:', err);
                this.errorMessage = err.message || "Something went wrong";
                });
        },
        sendMail(thisEmail) {
            fetch('/mail/welcome', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: thisEmail
                })
                })
                .then((res) => {
                    if (!res.ok) {
                    return res.text().then((msg) => { throw new Error(msg); });
                    }
                });
        },
        goToLogIn() {
            window.location.href = 'log-in.html';
        },
        googleLogin() {
            window.location.href = 'auth/google';
        }
    }
}).mount('#app');
