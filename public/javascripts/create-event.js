const {createApp} = Vue;

createApp({
    data() {
        return {
            searchQuery: '',
            title: '',
            location: '',
            date: '',
            start_time: '',
            end_time: '',
            description: '',
            total_tickets: 0,
            price: 0,
            selectedType: '',
            upload_images: [],
            email: '',
            isLoggedIn: false,
            eventTypes: ['Entertainment', 'Networking', 'Cultural', 'Workshop', 'Others'],
            success: '',
            dragging: false,
            exceed: '',
            errorMessage: ''
        };
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
    },
    methods: {
        submitForm() {
            // assemble FormData
            const formData = new FormData();
            formData.append('title', this.title);
            formData.append('description', this.description);
            formData.append('price', this.price);
            formData.append('total_tickets', this.total_tickets);
            formData.append('event_date', this.date);
            formData.append('event_location', this.location);
            formData.append('start_time', this.start_time);
            formData.append('end_time', this.end_time);
            formData.append('event_type', this.selectedType);
            // append each file under the same field name (so multer.array('images')
            this.upload_images.forEach(({ file }) => {
                formData.append('images', file);
            });

            fetch('/event/create/submit', {
                method: 'POST',
                body: formData
            })
            .then((res) => {
                if (!res.ok) return res.text().then((t) => Promise.reject(t));
                window.location.href ='/event/created';
                return null;
            });
        },
        handleFiles(e) {
            this.addFiles(e.target.files);
        },
        handleDrop(e) {
            this.dragging = false;
            this.addFiles(e.dataTransfer.files);
        },
        addFiles(fileList) {
            for (const file of fileList) {
                if(this.upload_images.length >= 5) {
                    this.exceed = "Maximum 5 images.";
                    return;
                }
                if (!file.type.startsWith('image/')) continue;
                const previewUrl = URL.createObjectURL(file);
                this.upload_images.push({ file, previewUrl });
            }
        },
        removeImage(index) {
            URL.revokeObjectURL(this.upload_images[index].previewUrl);
            this.upload_images.splice(index, 1);
        },
        upTicket() {
            this.total_tickets = this.total_tickets + 1;
        },
        downTicket() {
            if (this.total_tickets <= 0) {
                this.total_tickets = 0;
                return;
            }
            this.total_tickets = this.total_tickets - 1;
        },
        upPrice() {
            this.price = this.price + 1;
        },
        downPrice() {
            if (this.price <= 0) {
                this.price = 0;
                return;
            }
            this.price = this.price - 1;
        },
        onSubmitSearch() {
            const q = this.searchQuery.trim();
            if (q) {
                window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
            }
        }
    }
}).mount('#app');
