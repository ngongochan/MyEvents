import { formatDate, formatTime } from './utility.js';
const { createApp } = Vue;
const OPEN_WEATHER_API_KEY = "990d64b95987f27ebf8e5487543898c1";
const lat = '-34.921230';
const lon = '138.599503';
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
    mounted() {
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

            const eventDate = new Date(this.event.event_date);
            const now = new Date();
            const maxForecastDate = new Date();
            maxForecastDate.setDate(now.getDate() + 8);

            if (eventDate <= maxForecastDate) {
                fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=16&appid=${OPEN_WEATHER_API_KEY}`)
                .then((res) => res.json())
                .then((data) => {
                const eventUnix = Math.floor(eventDate.getTime() / 1000);
                const matchedDay = data.daily.find((d) => {
                    const dayUnix = d.dt;
                    const dayStart = dayUnix;
                    const dayEnd = dayUnix + 86400;
                    return eventUnix >= dayStart && eventUnix < dayEnd;
                });

                if (matchedDay) {
                    const maxTemp = Math.round(matchedDay.temp.max);
                    const minTemp = Math.round(matchedDay.temp.min);
                    this.weatherDescription = `${matchedDay.summary}. Temperatures range from ${minTemp}°C to ${maxTemp}°C.`;
                }
                });
            }
        });
    },


    methods: {
        formatDate,
        formatTime,
        increment() {
            this.quantity++;
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
        }
    }
}).mount('#app');
