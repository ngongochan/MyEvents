var express = require('express');
const db = require('../db/db');
var router = express.Router();


router.get('/all-events', async function(req, res, next) {
  const [events] = await db.query(
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
  res.status(200).json(events);
  console.log("Sent event infor to homepage.");
});

module.exports = router;
