var express = require('express');
const db = require('../db/db');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/all-events', async function(req, res, next) {
  const [events] = await db.query(
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
  res.status(200).json(events);
  console.log("Sent event infor to homepage.");
});

module.exports = router;
