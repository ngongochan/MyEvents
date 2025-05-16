var express = require('express');
const db = require('../db/db');
const bcrypt = require('bcrypt');
var router = express.Router();

async function comparePassword(password, storedHash) {
    const ans = await bcrypt.compare(password, storedHash);
    return ans;
}

router.post('/signup/submit', async function (req, res, next) {
    try {
        const user = req.body;

        // 1) Check email existence
        const [rows] = await db.query(
            `SELECT EXISTS(
            SELECT 1 FROM users WHERE email = ?
            ) AS email_exists;`,
            [user.email]
        );
        if (rows[0].email_exists === 1) {
            return res.status(400).send("Email already exists");
        }

        // 2) Hash password
        // const hashed = hashPassword(user.password);
        const hashed = await bcrypt.hash(user.password, 10);

        // 3) Insert new user (avatar and user_id are auto-handled by MySQL)
        await db.query(
            `INSERT INTO users
            (first_name, last_name, user_password,
                email, phone_number, student_id, user_role)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
            user.firstName,
            user.lastName,
            hashed,
            user.email,
            user.phoneNumber,
            user.studentID,
            user.role || 'guest'
            ]
        );
        const [data] = await db.query("SELECT * FROM users WHERE email = ?", [user.email]);
        const currUser = data[0];
        req.session.user = {
            id: currUser.user_id,
            email: currUser.email,
            role: currUser.user_role
        };

        res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  });

router.post('/login/submit', async function (req, res, next) {
    try {
        // 1) Destructure as properties, not array
        const { email, password } = req.body;

        // 2) Look up the user by email
        const [rows] = await db.query(
        'SELECT user_password FROM users WHERE email = ?',
        [email]
        );

        // 3) If no user, bail out
        if (rows.length === 0) {
            return res.status(400).send("Invalid email or password!");
        }

        const storedHash = rows[0].user_password;

        // 4) Compare plaintext to stored hash (bcrypt.compare under the hood)
        const isMatch = await comparePassword(password, storedHash);
        if (!isMatch) {
            return res.status(400).send("Invalid email or password!");
        }

        const [data] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        const currUser = data[0];
        req.session.user = {
            id: currUser.user_id,
            email: currUser.email,
            role: currUser.user_role
        };

        // 5) Success
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

router.get('/signout', (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.sendStatus(402);
    }
});

router.get('/signout', (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.sendStatus(500);
      res.clearCookie('sid');
      return res.sendStatus(200);
    });
});

module.exports = router;
