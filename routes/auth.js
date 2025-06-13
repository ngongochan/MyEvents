var express = require('express');
const db = require('../db/db');
const bcrypt = require('bcrypt');
var router = express.Router();
var passport = require('passport');


router.post('/signup/submit', async function (req, res, next) {
    try {
        if (req.session.user) {
            return res.render('error');
        }
        const user = req.body;

        // Prevent user signup as admin
        if (user.role.toLowerCase() === 'admin') {
            return res.render('error');
        }
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
        res.status(200).send();
    } catch (err) {
      next(err);
    }
  });

router.post('/login/submit', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      if (err) {
        console.error('Auth error:', err);
        return res.status(500).send('Server error');
      }
      if (!user) {

        return res.status(400).send(info.message || 'Invalid email or password');
      }


      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.status(500).send('Login failed');
        }


        req.session.user = {
          id: user.user_id,
          email: user.email,
          role: user.user_role
        };

        return res.sendStatus(200);
      });
    } catch (e) {
      return res.sendStatus(500);
    }
  })(req, res, next);
});

router.get('/signout', (req, res, next) => {
  // 1) If they’re not logged in, show an error
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).render('error');
  }

  // 2) Passport logout
  req.logout(function(err) {
    if (err) {
      console.error('Logout error:', err);
      return res.sendStatus(400);
    }

    // 3) Destroy session
    req.session.destroy((error) => {
      if (error) {
        console.error('Session destroy error:', error);
        return res.sendStatus(500);
      }

      // 4) Clear the cookie
      res.clearCookie('connect.sid', { path: '/' });

      // 5) Redirect or send status
      return res.redirect('/');
    });
  });
});



router.get('/google', passport.authenticate('google',{ scope:['profile','email'] }));

router.get(
  '/login/google/callback',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) return res.status(500).send('Server error');
      if (!user) return res.redirect('/error');


      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.status(500).send('Login failed');
        }
        req.session.user = {
          id: user.user_id,
          email: user.email,
          role: user.user_role
        };

        return res.redirect('/');
      });
    })(req, res, next);
  }
);


module.exports = router;
