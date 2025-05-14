var express = require('express');
const db = require('../db/db');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/', async function(req, res, next) {
  const [events] = await db.query('SELECT * FROM events');
  res.status(200).json(events);
  console.log("Sent event infor to homepage.");
});

module.exports = router;
