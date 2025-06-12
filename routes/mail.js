var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var path = require('path');

var nodemailer = require('nodemailer');
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
    const { recipient, name, eventTitle, message } = req.body;

    // path to EJS file
    const templatePath = path.join(__dirname, '..', 'email_template', 'confirmation.ejs');

    // renderFile returns HTML
    const html = await ejs.renderFile(templatePath, {
      name,
      eventTitle,
      message,
      imageCid: 'eventImage'
    });

    await transporter.sendMail({
      from: 'myevents.uoa@gmail.com',
      to: recipient,
      subject: `Confirmation for ${eventTitle}`,
      html,
      attachments: [
        {
          filename: 'image.jpg',
          path: 'email_template/email_image/image.jpg',
          cid: 'eventImage'
        }
      ]
    });

    res.sendStatus(200);
  } catch (err) {
    console.error('Email send failed:', err);
    next(err);
  }
});
module.exports = router;
