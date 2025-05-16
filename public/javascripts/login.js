const {createApp} = Vue;

createApp ({
    data() {
        return {
            email: '',
            password: '',
            errorMessage: ''
        };
    },
    methods: {
        submitForm() {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/login/login/submit', true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        window.location.href = '/';
                    } else {
                        try {
                            const response = xhr.responseText;
                            this.errorMessage = response;
                        } catch(err) {
                            this.errorMessage = "An error occurred.";
                        }
                    }
                }
            };

            xhr.send(JSON.stringify({
                email: this.email,
                password: this.password
            }));
        }
    }
}).mount('#app');
