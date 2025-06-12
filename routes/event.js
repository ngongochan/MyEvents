const express = require('express');
const db = require('../db/db');
const multer = require('multer');
const path = require('path');
const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '../public/images/event_images')),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

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
router.post('/create/submit', upload.array('images', 5), async function(req, res, next) {

    try {
        const event = req.body;
        const [insertedEvent] = await db.query(
            `INSERT INTO events
            (host, title, description, price, remaining, total_tickets,
            event_date, event_location, start_time, end_time, event_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.session.user.id,
                event.title,
                event.description,
                event.price,
                event.total_tickets,
                event.total_tickets,
                event.event_date,
                event.event_location,
                event.start_time,
                event.end_time,
                event.event_type
            ]
        );
        const event_id = insertedEvent.insertId;

        if (req.files && req.files.length) {
            const inserts = req.files.map((file, idx) =>
            db.query(
                `INSERT INTO event_images (event_id, image_name, image_order)
                VALUES (?, ?, ?)`,
                [event_id, file.filename, idx + 1]
            ));
            await Promise.all(inserts);
        }

        return res.status(200).render('createdEvent');
    } catch(err) {
        console.error('Error storing event:', err);
        // send a 500 status with the error message
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/created', (req,res) => {
    res.render('createdEvent');
});

// Buy ticket
router.post('/ticket', async function(req, res) {
  try {
    if (!req.session.user) {
      return res.sendStatus(400);
    }

    const { event_id, quantity, price } = req.body;

    // 1) fetch remaining tickets
    const [rows] = await db.query(
      `SELECT remaining FROM events WHERE event_id = ?`,
      [event_id]
    );
    if (!rows.length) {
      return res.sendStatus(404);
    }
    const [{ remaining }] = rows;

    if (remaining < quantity) {
      return res.sendStatus(400);
    }

    // 2) create the order
    const [orderResult] = await db.query(
      `INSERT INTO orders
         (user_id, event_id, number_of_tickets, total_price)
       VALUES (?, ?, ?, ?)`,
      [req.session.user.id, event_id, quantity, price]
    );
    const orderId = orderResult.order_id;

    // 3) insert each ticket
    const inserts = Array.from({ length: ticket.quantity }, () => db.query(
            `INSERT INTO tickets (order_id) VALUES (?)`,
            [orderId]
    ));


    await Promise.all(inserts);

    // 4) update remaining
    await db.query(
      `UPDATE events SET remaining = ? WHERE event_id = ?`,
      [remaining - quantity, event_id]
    );

    return res.status(200).render('ticketed');

  } catch (err) {
    console.error('Error storing ticket:', err);
    return res
      .status(500)
      .json({ success: false, error: err.message });
  }
});

module.exports = router;
