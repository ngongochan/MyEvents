var express = require('express');
const db = require('../db/db');
const session = require('express-session');
var router = express.Router();

// return detail of event corresponding with the given id

router.get('/detail', async function(req, res, next) {
    const id = req.query.event_id;
    if (id) {
        const [rows] = await db.query("SELECT * FROM events WHERE event_id = ?", [id]);
        if (rows.length !== 1) {
            res.sendStatus(404);
            return;
        }
        const event = rows[0];
        res.status(400).json(event);
    } else {
        res.redirect('/');
    }
});

// return event base on search keyword

router.get('/search', async function(req, res, next) {
    const keyword = req.query.q;
    if (keyword) {
        const [rows] = await db.query('SELECT * FROM events WHERE title LIKE ?', [`%${keyword}%`]);
        res.json(rows);
    } else {
        res.redirect('/');
    }
});

// Middle ware function to require login before create event
router.use('/create/*', function(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
});

// Add event into the database
router.post('/create/submit', async function(req, res, next) {
    const event = req.body;
    if (event) {
        await db.query(
            `INSERT INTO events
            (owner, title, description, price, ticket_count,
            event_date, event_location, start_time, end_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.session.user.id,
                event.title,
                event.description,
                event.price,
                event.ticket_count,
                event.event_date,
                event.event_location,
                event.start_time,
                event.end_time
            ]
        );
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});
module.exports = router;
