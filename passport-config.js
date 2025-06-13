// passport-config.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const db = require('./db/db');

require('dotenv').config();

passport.serializeUser((user, done) => done(null, user.user_id))
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE user_id = ?', [id]
    );
    done(null, rows[0] || false);
  } catch (err) {
    done(err);
  }
});

// define how to check email and password
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const [users] = await db.query(
        'SELECT * FROM users WHERE email = ?', [email]
      );
      const user = users[0];
      if (!user) return done(null, false, { message: 'Invalid email or password' });

      // compare submitted password to hash
      const ok = await bcrypt.compare(password, user.user_password);
      if (!ok) return done(null, false, { message: 'Invalid email or password' });

      // success
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/auth/login/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const googleId = profile.id;
      const email    = profile.emails?.[0]?.value;
      const first_name    = profile.name?.givenName  || 'User';
      const last_name  = profile.name?.familyName || ' ';

      // 2) See if we already have an auth_credentials row
      const [creds] = await db.query(
        `SELECT user_id FROM auth_credentials
           WHERE strategy = 'google' AND provider_id = ?`,
        [googleId]
      );
      let userId = creds[0]?.user_id;

      // 3) If not, try matching an existing user by email
      if (!userId && email) {
        const [users] = await db.query(
          `SELECT user_id FROM users WHERE email = ?`,
          [email]
        );
        userId = users[0]?.user_id;
      }

      // 4) If we still don’t have a user, create one
      if (!userId) {

        const [r] = await db.query(
          `INSERT INTO users
             (first_name, last_name, email)
           VALUES (?, ?, ?)`,
          [first_name, last_name, email]
        );
        userId = r.insertId;
      }

      // 5) Ensure we have an auth_credentials linking table row
      if (!creds[0]) {
        await db.query(
          `INSERT INTO auth_credentials
             (user_id, strategy, provider_id)
           VALUES (?, 'google', ?)`,
          [userId, googleId]
        );
      }

      // 6) Load the full user record and finish
      const [userRows] = await db.query(
        `SELECT * FROM users WHERE user_id = ?`,
        [userId]
      );
      return done(null, userRows[0]);
    } catch (err) {
      return done(err);
    }
  }
));
module.exports = passport;
