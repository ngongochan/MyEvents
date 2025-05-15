var express = require('express');
const db = require('../db/db');
var router = express.Router();

// return detail of event corresponding with the given id

router.get('/detail', async function(req, res, next) {
    const id = req.query.event_id;
    if (id) {
        const [rows] = await db.query(
            `SELECT
                e.*,
                i.image_path
            FROM events AS e
            LEFT JOIN event_images AS i
                ON e.event_id = i.event_id
            WHERE e.event_id = ?`,
            [id]
        );
        // only return 1 image need to fix this
        const event = rows[0];
        res.status(400).json(event);
    } else {
        res.redirect('/');
    }
});

// return event base on search keyword

router.get('/search', async function(req, res, next) {
    if ('q' in req.query) {
        const keyword = req.query.q;
        const [rows] = await db.query(
            `
            SELECT
                e.*,
                (
                SELECT image_path
                FROM event_images
                WHERE event_id = e.event_id
                ORDER BY image_order
                LIMIT 1
                ) AS image_path
            FROM events AS e
            WHERE e.title LIKE ?
            `,
            [`%${keyword}%`]
        );
        res.json(rows);
    } else {
        const [rows] = await db.query(
            `
            SELECT
                e.*,
                (
                SELECT image_path
                FROM event_images
                WHERE event_id = e.event_id
                ORDER BY image_order
                LIMIT 1
                ) AS image_path
            FROM events AS e
            `
        );
        res.json(rows);
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
        const [insertedEvent] = await db.query(
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
        const event_id = insertedEvent.insertId;
        if (Array.isArray(event.images) && event.images.length) {
            // build an array of promises
            const inserts = event.images.map((path, i) => db.query(
                    `INSERT INTO event_images
                    (event_id, image_path, image_order)
                    VALUES (?, ?, ?)`,
                    [event_id, path, i + 1]
            ));
            await Promise.all(inserts);

        }
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});
module.exports = router;
