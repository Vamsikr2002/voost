const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Ensure User model is registered
const User = require('../models/User');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: 'That email is not registered' });
          }

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
        })
        .catch((err) => console.log(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (token, tokenSecret, profile, done) => {
        const { id, displayName, emails, photos } = profile;
        const email = emails[0].value;
        const photo = photos[0].value;

        try {
          let user = await User.findOne({ email });

          if (user) {
            return done(null, user);
          } else {
            const newUser = new User({
              name: displayName,
              email,
              photo,
              password: id,
            });

            await newUser.save();
            return done(null, newUser);
          }
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  // Other Strategies (Facebook, Twitter, GitHub) follow a similar pattern as GoogleStrategy
};
