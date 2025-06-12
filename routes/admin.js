var express = require('express');
const db = require('../db/db');
const session = require('express-session');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '../public/images/user_avatar')),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.use(function(req, res, next) {
    if(req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.render('error');
    }
});

router.get('/dashboard', async function(req, res) {
    try {
        const email = req.query.email;
        const title = req.query.title;
        console.log(email);
        console.log(title);
        let [users] = await db.query("SELECT * FROM users;");
        let [events] = await db.query("SELECT * FROM events;");
        if (email) {
            [users] = await db.query("SELECT * FROM users WHERE email LIKE ?;", [`%${email}%`]);
        }
        if (title) {
            [events] = await db.query("SELECT * FROM events WHERE title LIKE ?;", [`%${title}%`]);
        }
        res.render('admin', {
            users: users,
            events: events
        });
    } catch(err) {
        res.render('error');
    }
});

router.post('/event/delete', async function(req, res) {
    try {
        const id = req.body.event_id;
        console.log("Deleting event", id);
        const [events] = await db.query(
            `SELECT event_id
            FROM events
            WHERE event_id = ?`,
            [id]);
        if (events.length === 0) {
            return res.sendStatus(404);
        }

        await db.query("DELETE FROM events WHERE event_id = ?", [id]);

        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).send("Server error while deleting event.");
    }
});


router.post('/event/adjust', async function(req, res) {
    try {
        const event = req.body;
        console.log(event.event_id);
        const [ids] = await db.query(
            `SELECT event_id
            FROM events
            WHERE event_id = ?`,
            [event.event_id]);
        if (ids.length !== 1) {
            return res.sendStatus(404);
        }

        await db.query(
            `UPDATE events
            SET host = ?,
                title = ?,
                description = ?,
                price = ?,
                remaining = ?,
                total_tickets = ?,
                event_date = ?,
                event_location = ?,
                start_time = ?,
                end_time = ?,
                event_status = ?,
                event_type = ?
            WHERE event_id = ?`,
            [
                event.host,
                event.title,
                event.description,
                event.price,
                event.remaining,
                event.total_tickets,
                event.event_date,
                event.event_location,
                event.start_time,
                event.end_time,
                event.event_status,
                event.event_type,
                event.event_id
            ]
            );
        res.sendStatus(200);
    } catch (error) {
        console.error("Error editing event:", error);
        res.status(500).send("Server error while editting event.");
    }
});

router.post('/user/delete', async function(req, res) {
    try {
        const userId = req.body.user_id;
        console.log("Deleting user:", userId);

        const [user] = await db.query(
            `SELECT user_id
            FROM users
            WHERE user_id = ?`,
            [userId]
        );
        if (user.length === 0) {
            return res.sendStatus(404);
        }

        await db.query("DELETE FROM users WHERE user_id = ?", [userId]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Server error while deleting user.");
    }
});

router.post('/user/adjust', upload.single('avatar_file'), async function(req, res) {
    try {
        console.log("Adjusting user");
        const user = req.body;
        const [row] = await db.query(
            `SELECT *
            FROM users
            WHERE user_id = ?`,
            [user.user_id]
        );
        if (row.length !== 1) {
            return res.sendStatus(404);
        }

        const [existed_email] = await db.query(
            `SELECT *
            FROM users
            WHERE email = ?
            AND user_id <> ?`,
            [user.email, user.user_id]
        );
        if (existed_email.length >= 1) {
            return res.sendStatus(400);
        }
        var avatar;
        if (req.file) {
            avatar = req.file.filename;
        } else {
            avatar = user.avatar;
        }
        await db.query(
            `UPDATE users
            SET first_name= ?,
            last_name = ?,
            title = ?,
            avatar = ?,
            user_role = ?,
            student_id = ?,
            email = ?,
            phone_number = ?
            WHERE user_id = ?`,
            [
                user.first_name, user.last_name,
                user.title, avatar, user.user_role,
                user.student_id, user.email,
                user.phone_number, user.user_id
            ]
        );
        res.sendStatus(200);
    } catch (error) {
        console.error("Error inserting event:", error);
        res.status(500).send("Server error while inserting event.");
    }
});

router.post('/user/insert', upload.single('avatar_file'), async function(req, res) {
    try {
        const user = req.body;
        const [existed_email] = await db.query(
            `SELECT *
            FROM users
            WHERE email = ?
            AND user_id <> ?`,
            [user.email, user.user_id]
        );
        if (existed_email.length >= 1) {
            return res.sendStatus(300);
        }
        var avatar;
        if (req.file) {
            avatar = req.file.filename;
        } else {
            avatar = user.avatar;
        }
        const hashed = await bcrypt.hash(user.user_password, 10);
        await db.query(
            `INSERT INTO users (
            first_name, last_name, title,
            user_password, avatar, user_role,
            student_id, email, phone_number
            )
            VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user.first_name, user.last_name,
                user.title, hashed, avatar, user.user_role,
                user.student_id, user.email,
                user.phone_number
            ]
        );
        res.sendStatus(200);
        if (existed_email.length >= 1) {
            return res.sendStatus(400);
        }
    } catch (error) {
        console.error("Error inserting event:", error);
        res.status(500).send("Server error while inserting event.");
    }
});




module.exports = router;
