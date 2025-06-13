import { formatDate, formatTime } from './utility.js';
const { createApp } = Vue;
const OPEN_WEATHER_API_KEY = "990d64b95987f27ebf8e5487543898c1";
const lat = -34.921230;
const lon = 138.599503;
createApp({
    data() {
        return {
            event: null,
            quantity: 1,
            email: '',
            isLoggedIn: false,
            weatherDescription: ''
        };
    },
    async mounted() {
        // initDetailPage()
        const params = new URLSearchParams(window.location.search);
        const id = params.get('event_id');
        if (!id) {
            return window.location.replace('/');
        }
        fetch(`/event/detail?event_id=${encodeURIComponent(id)}`)
        .then((res) => res.json())
        .then((rows) => {
            [this.event] = rows;
            this.fetchWeatherForEvent();
        });
        fetch('/api/session-status')
        .then((res) => res.json())
        .then(({ isLoggedIn, email }) => {
            this.isLoggedIn = isLoggedIn;
            this.email = email || '';
        });
    },


    methods: {
        formatDate,
        formatTime,
        increment() {
            this.quantity++;
        },
        onSubmitSearch() {
            const q = this.searchQuery.trim();
            if (q) {
                window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
            }
        },
        decrement() {
            if (this.quantity > 1) this.quantity--;
        },
        async purchase() {
            if (!this.isLoggedIn) {
                alert('Please log in to purchase tickets!');
                return;
            }
            try {
                const ticketResult = await fetch('/event/ticket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event_id: this.event.event_id,
                        quantity: this.quantity,
                        price: this.event.price * this.quantity
                    })
                });
                if (!ticketResult.ok) {
                    alert('Not enough tickets or error in purchase!');
                    return;
                }
                const emailResult = await fetch('/mail/confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventTitle: this.event.title
                    })
                });
                if (!emailResult.ok) {
                    alert('Purchase complete, but email failed to send.');
                    return;
                }

                alert('Purchase successful! Check your email for confirmation.');
            } catch (err) {
                alert('Something went wrong. Please try again.');
                console.error(err);
            }
        },
        async fetchWeatherForEvent() {

            const eventDate = new Date(this.event.event_date);


            const now = new Date();
            const cutoff = new Date();
            cutoff.setDate(now.getDate() + 16);
            if (eventDate > cutoff) return;

            const url = `https://api.openweathermap.org/data/2.5/forecast/daily`
            + `?lat=${lat}`
            + `&lon=${lon}`
            + `&cnt=16`
            + `&units=metric`
            + `&appid=${OPEN_WEATHER_API_KEY}`;

            try {
            const res = await fetch(url);
            if (!res.ok) {
                console.error('Weather API error', await res.json());
                return;
            }
            const data = await res.json();
            const timestamp = Math.floor(eventDate.getTime() / 1000);
            const day = (data.list || []).find(d =>
                timestamp >= d.dt && timestamp < d.dt + 86400
            );

            if (day) {
                const maxTemp = Math.round(day.temp.max);
                const minTemp = Math.round(day.temp.min);
                const desc   = day.weather[0].description;
                this.weatherDescription =
                `${desc.charAt(0).toUpperCase() + desc.slice(1)} — ${minTemp}°C to ${maxTemp}°C.`;
            }
            } catch (err) {
            console.error('Fetch failed:', err);
            }
        }
    }
}).mount('#app');
