var express = require('express');
const db = require('../db/db');
var router = express.Router();


router.get('/all-events', async function(req, res, next) {
  const [events] = await db.query(
      `
      SELECT
          e.event_id, e.title, e.description, e.price, e.event_type, e.start_time,
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
  res.status(200).json(events);
  console.log("Sent event info to homepage.");
});

module.exports = router;
