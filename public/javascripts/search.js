import { formatDate, formatTime } from './utility.js';

const { createApp } = Vue;

createApp({
    data() {
        return {
            queryInput: '',
            searchQuery: '',
            events: [],
            typeFilter: '',
            email: '',
            isLoggedIn: false,
            categories: [
                { key: 'networking', label: 'Networking events' },
                { key: 'entertainment', label: 'Entertainment events' },
                { key: 'workshop', label: 'Workshops' },
                { key: 'cultural', label: 'Cultural events' },
                { key: 'Others', label: 'Others' }
            ],
            dateFilter: 'All dates',
            priceFilter: 'Prices',
            categoryFilter: 'Categories'
        };
    },
    computed: {
        filteredEvents() {
            const q = this.searchQuery.toLowerCase().trim();
            const t = this.typeFilter.toLowerCase();
            const today = new Date();
            const startOfWeek = (() => {
                const d = new Date(today);
                const day = d.getDay();
                const diff = day - 1;
                if (diff < 0) {
                    this.diff = 6;
                }
                d.setDate(diff);
                d.setHours(0, 0, 0, 0);
                return d;
            });
            const endOfWeek = (() => {
                const d = new Date(startOfWeek);
                d.setDate(d.getDate() + 6);
                return d;
            });
            return this.events.filter(e => {
                const eventDate = new Date(e.event_date);
                const price = Number(e.price);
                const title = e.title.toLowerCase();
                const type = e.event_type.toLowerCase();
                const categorySelected = this.categoryFilter.toLowerCase() === 'categories' || type === this.categoryFilter.toLowerCase();
                let dateSelected = true;
                switch(this.dateFilter) {
                    case 'Today':
                        dateSelected = eventDate.toDateString() === today.toDateString();
                        break;
                    case 'This week':
                        dateSelected = eventDate >= startOfWeek && eventDate <= endOfWeek;
                        break;
                    case 'This month':
                        dateSelected = eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
                        break;
                    default:
                        dateSelected = true;
                        break;
                }
                let priceSelected = true;
                if (this.priceFilter === 'Free') {
                    priceSelected = price === 0;
                } else if (this.priceFilter === 'Paid') {
                    priceSelected = price > 0;
                } else {
                    priceSelected = true;
                }
                const textMatch = !q || title.includes(q);
                return categorySelected && textMatch && dateSelected && priceSelected;
            });
        },
        groupedFilteredEvent() {
            return this.categories.map((cat) => ({
                key: cat.key,
                label: cat.label,
                items: this.filteredEvents.filter(e => e.event_type.toLowerCase() === cat.key.toLowerCase())
            })).filter((group) => group.items.length > 0);
        }
    },
    methods: {
        formatDate,
        formatTime,
        onSubmitSearch() {
            const q = this.queryInput.trim();
            window.history.replaceState(null, '', `?q=${encodeURIComponent(q)}`);
            this.searchQuery = q;
        }
    },
    mounted() {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || '';
        this.queryInput = q;
        this.searchQuery = q;
        fetch('/all-events')
            .then((res) => res.json())
            .then((events) => {
                this.events = events;
            }).catch(console.error);
        fetch('/api/session-status')
            .then((res) => res.json())
            .then(({ isLoggedIn, email }) => {
                this.isLoggedIn = isLoggedIn;
                this.email = email || '';
            });
    }
}).mount('#app');
