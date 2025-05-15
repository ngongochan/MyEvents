var express = require('express');
const db = require('../db/db');
var router = express.Router();
var multer = require('multer');
const { fileLoader } = require('ejs');
var upload = multer({ dest: 'public/images/event_images/' });

// return detail of event corresponding with the given id

router.get('/detail', async function(req, res, next) {
    const id = req.query.event_id;
    if (id) {
        const [rows] = await db.query(
            `SELECT
                e.*,
                i.image_name
            FROM events AS e
            LEFT JOIN event_images AS i
                ON e.event_id = i.event_id
            WHERE e.event_id = ?`,
            [id]
        );
        res.status(200).json(rows);
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
                SELECT image_name
                FROM event_images
                WHERE event_id = e.event_id
                ORDER BY image_order
                LIMIT 1
                ) AS image_name
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
                SELECT image_name
                FROM event_images
                WHERE event_id = e.event_id
                ORDER BY image_order
                LIMIT 1
                ) AS image_name
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
router.post('/create/submit', upload.array('file', 5), async function(req, res, next) {

    try {
        const event = req.body;
        const [insertedEvent] = await db.query(
            `INSERT INTO events
            (host, title, description, price, ticket_count,
            event_date, event_location, start_time, end_time, event_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.session.user.id,
                event.title,
                event.description,
                event.price,
                event.ticket_count,
                event.event_date,
                event.event_location,
                event.start_time,
                event.end_time,
                event.event_type
            ]
        );
        const event_id = insertedEvent.insertId;
        if (req.files && req.files.length) {
            // build an array of promises
            console.log(`Uploading images...`);
            const inserts = req.files.map((file, i) => db.query(
                    `INSERT INTO event_images
                    (event_id, image_name, image_order)
                    VALUES (?, ?, ?)`,
                    [event_id, file.filename, i + 1]
            ));
            await Promise.all(inserts);

        }
        res.sendStatus(200);
    } catch(err) {
        console.log('Unable to store event information');
        res.sendStatus(err);
    }
});
module.exports = router;
