// var express = require('express');
// const db = require('../db/db');
// const session = require('express-session');
// var router = express.Router();

// router.use('/*', function(req, res, next) {
//     if(session.user && req.session.user.role === 'admin') {
//         next();
//     } else {
//         res.render('denied', { titlle: "Access denied" });
//     }
// });

// router.get('/dashboard', async function(req, res) {
//     const [users] = await db.query("SELECT * FROM users;");
//     const [events] = await db.query("SELECT * FROM events;");
//     res.render('admin', {
//         title: " dashboard",
//         users: users,
//         events: events
//     });
// });

// router.get('/event/delete', async function(req, res) {
//     try {
//         const id = req.query.q;
//         const [events] = await db.query(
//             `SELECT event_id
//             FROM events
//             WHERE event_id = ?`,
//             [id]);
//         if (events.length === 0) {
//             return res.status(404).send("Event not found!");
//         }

//         await db.query("DELETE FROM events WHERE event_id = ?", [id]);

//         res.status(200).send("Deleted successfully!");
//     } catch (error) {
//         console.error("Error deleting event:", error);
//         res.status(500).send("Server error while deleting event.");
//     }
// });


// router.post('/event/adjust', async function(req, res) {
//     try {
//         // try to adjust event
//     } catch (error) {
//         console.error("Error editing event:", error);
//         res.status(500).send("Server error while editting event.");
//     }
// });

// router.post('/user/delete', async function(req, res) {
//     try {
//         // delete user
//     } catch (error) {
//         console.error("Error inserting event:", error);
//         res.status(500).send("Server error while inserting event.");
//     }
// });

// router.post('/user/adjust', async function(req, res) {
//     try {
//         // adjust user
//     } catch (error) {
//         console.error("Error inserting event:", error);
//         res.status(500).send("Server error while inserting event.");
//     }
// });

// router.post('/user/insert', async function(req, res) {
//     try {
//         // insert user
//     } catch (error) {
//         console.error("Error inserting event:", error);
//         res.status(500).send("Server error while inserting event.");
//     }
// });




