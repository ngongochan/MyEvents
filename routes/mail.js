var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var path = require('path');

var nodemailer = require('nodemailer');
const db = require('../db/db');
let transporter = nodemailer.createTransport( {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASS
     }
});

router.post('/confirmation', async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.sendStatus(400);
    }
    const { eventTitle } = req.body;
    const userId = req.session.user.id;
    const userEmail= req.session.user.email;

    // fetch user name
    const [rows] = await db.query(
      `SELECT first_name, last_name FROM users WHERE user_id = ?`,
      [userId]
    );
    if (!rows.length) return res.sendStatus(400);
    const user = rows[0];
    const name = `${user.first_name} ${user.last_name}`;

    // render EJS
    const templatePath = path.join(__dirname, '..', 'email_template', 'confirmation.ejs');
    const html = await ejs.renderFile(templatePath, {
      name,
      eventTitle
    });

    await transporter.sendMail({
      from: 'myevents.uoa@gmail.com',
      to: userEmail,
      subject: `Confirmation for ${eventTitle}`,
      html
    });

    // log it
    await db.query(
      `INSERT INTO email_logs(user_id, email_type, is_send)
       VALUES (?, ?, ?)`,
      [userId, 'ticket', true]
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error('Email send failed:', err);
    return res.sendStatus(500);
  }
});

router.post('/welcome', async (req, res, next) => {
  try {
    const { email } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?',[email]);
    if (rows.length === 0) {
      return res.sendStatus(400);
    }

    const { user_id: userId, first_name, last_name } = rows[0];
    const name = `${first_name} ${last_name}`;
    // render EJS
    const templatePath = path.join(__dirname, '..', 'email_template', 'welcome.ejs');
    const html = await ejs.renderFile(templatePath, {
      name
    });


    await transporter.sendMail({
      from: 'myevents.uoa@gmail.com',
      to: email,
      subject: `Welcome to MyEvents`,
      html
    });

    // log it
    await db.query(
      `INSERT INTO email_logs(user_id, email_type, is_send)
       VALUES (?, ?, ?)`,
      [userId, 'welcome', true]
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error('Email send failed:', err);
    return res.sendStatus(500);
  }
});
module.exports = router;
