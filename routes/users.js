var express = require('express');
const db = require('../db/db');
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

async function comparePassword(password, storedHash) {
    const ans = await bcrypt.compare(password, storedHash);
    return ans;
}


router.use('/*', function(req, res, next) {
    if(req.session.user) {
        next();
    } else {
        res.status(404).render('error');
    }
});

router.get('/info', async function(req, res) {
  const [user] = await db.query(
    `SELECT *
    FROM users
    WHERE user_id = ?`,
    [req.session.user.id]
  );
  res.status(200).json(user);
});

router.get('/upcommingevent', async function(req, res) {
  const [events] = await db.query(
    `SELECT DISTINCT
      e.event_id,
      e.title,
      e.description,
      e.event_date,
      e.event_location,
      e.start_time,
      (
        SELECT image_name
        FROM event_images
        WHERE event_id = e.event_id
        ORDER BY image_order
        LIMIT 1
      ) AS image_name
    FROM events AS e
    INNER JOIN orders AS o
      ON e.event_id = o.event_id
    WHERE o.user_id = ?
      AND e.event_date >= CURDATE()`,
    [req.session.user.id]
  );
  res.json(events);

});

router.get('/pastevent', async function(req, res) {
  const [events] = await db.query(
      `SELECT DISTINCT
        e.event_id,
        e.title,
        e.description,
        e.event_date,
        e.event_location,
        e.start_time,
        (
          SELECT image_name
          FROM event_images
          WHERE event_id = e.event_id
          ORDER BY image_order
          LIMIT 1
        ) AS image_name
      FROM events AS e
      INNER JOIN orders AS o
        ON e.event_id = o.event_id
      WHERE o.user_id = ?
        AND e.event_date < CURDATE()`,
      [req.session.user.id]
    );
    res.json(events);
});

router.get('/hostevent', async function(req, res) {
  const [events] = await db.query(
    `SELECT DISTINCT
      e.event_id,
      e.title,
      e.description,
      e.event_date,
      e.event_location,
      e.start_time,
      (
        SELECT image_name
        FROM event_images
        WHERE event_id = e.event_id
        ORDER BY image_order
        LIMIT 1
      ) AS image_name
    FROM events AS e
    WHERE e.host = ?
      AND e.event_date > CURDATE()`,
    [req.session.user.id]
  );
  res.json(events);
});

router.get('/hostedevent', async function(req, res) {
  const [events] = await db.query(
    `SELECT DISTINCT
      e.event_id,
      e.title,
      e.description,
      e.event_date,
      e.event_location,
      e.start_time,
      (
        SELECT image_name
        FROM event_images
        WHERE event_id = e.event_id
        ORDER BY image_order
        LIMIT 1
      ) AS image_name
    FROM events AS e
    WHERE e.host = ?
      AND e.event_date < CURDATE()`,
    [req.session.user.id]
  );
  res.json(events);
});

router.get('/delete-account', async function(req, res) {
  const userId = req.session.user.id;
  await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
  res.sendStatus(200);
});

router.post('/report', async function(req, res) {
  const report = req.body;
  await db.query(
    `INSERT INTO error_report (
    user_id,
    title,
    detail
    )
    VALUES ( ?, ?, ?)`,
    [
      req.session.user.id,
      report.title,
      report.detail
    ]
  );
  return res.sendStatus(200);
});

router.post('/edit', upload.single('avatar_file'), async function(req,res) {
  const user = req.body;
  const userId = req.session.user.id;
  const [existed_email] = await db.query(
        `SELECT *
        FROM users
        WHERE email = ?
        AND user_id <> ?`,
        [user.email, userId]
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
  if (user.user_role === "admin" && req.session.user.role !== "admin") {
    return res.sendStatus(400);
  }
  await db.query(
    `UPDATE users
    SET first_name = ?,
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
      user.phone_number, userId
    ]
  );
  return res.sendStatus(200);
});

router.post('/change-password', async function(req, res) {
  const userId = req.session.user.id;
  const password = req.body;
  const [rows] = await db.query(
    `SELECT user_password
    FROM users
    WHERE user_id = ?`,
    [userId]
  );
  if (rows.length === 0) {
    return res.status(200).json({ errorMessage: "User not found" });
  }
  const curPass = rows[0].user_password;
  const match = await comparePassword(password.cur, curPass);
  if (!password.cur || !match) {
    return res.status(200).json({ errorMessage: "Wrong Password" });
  }
  const hashed = await bcrypt.hash(password.new, 10);
  await db.query(
    `UPDATE users
    SET user_password = ?
    WHERE user_id = ?`,
    [
      hashed,
      userId
    ]
  );
  return res.status(200).json({ message: "Password updated successfully" });
});


module.exports = router;
