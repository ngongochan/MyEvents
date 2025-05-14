// var express = require('express');
// var router = express.Router();

// var nodemailer = require('nodemailer');
// let transporter = nodemailer.createTransport( {
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//         user: "myevents.uoa@gmail.com",
//         pass: process.env.GMAIL_PASS
//      }
// });

// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// /* Sends an email to the provided address. */
// router.post('/email', function(req, res, next) {
//   let info = transporter.sendMail({
//       from: "myevents.uoa@gmail.com", // sender address
//       to: req.body.recipient, // list of receivers
//       subject: req.body.subject, // Subject line
//       text: req.body.text, // plain text body
//       html: "<b>"+req.body.text+"</b>" // html body
//   });
//   res.send();
// });

// module.exports = router;
