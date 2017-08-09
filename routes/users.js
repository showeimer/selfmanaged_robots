const express = require('express');
const routes = express.Router();
const User = require('../models/user');
const flash = require('express-flash-messages');
const session = require('express-session');
const bodyParser = require('body-parser');

// require stuff for passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

routes.use(
  session({
    secret: 'keyboard kitten',
    resave: false,
    saveUninitialized: true
  })
);

// connect passport to express boilerplate
routes.use(passport.initialize());
routes.use(passport.session());
routes.use(flash());

routes.use(bodyParser.json());
routes.use(bodyParser.urlencoded({extended: false}));

// configure passport
passport.use(
  new LocalStrategy(function(email, password, done) {
    console.log('LocalStrategy', email, password);
    User.authenticate(email, password)
      // success!!
      .then(user => {
        if (user) {
          done(null, user);
        } else {
          done(null, null, { message: 'There was no user with this email and password.' });
        }
      })
      // there was a problem
      .catch(err => done(err));
  })
);

// store the user's id in the session
passport.serializeUser((user, done) => {
  // console.log('serializeUser');
  done(null, user._id);
});

// get the user from the session based on the id
passport.deserializeUser((id, done) => {
  // console.log('deserializeUser');
  User.findById(id).then(user => done(null, user));
});


// HOME PAGE =================================================

// this middleware function will check to see if we have a user in the session.
// if not, we redirect to the login form.
const requireLogin = (req, res, next) => {
  console.log('req.user', req.user);
  if (req.user) {
    next();
  } else {
    console.log('Not logged in, redirecting...')
    res.redirect('/login');
  }
};

routes.get('/', requireLogin, function(request, response) {

  User.find()
  .then(userdirectories => response.render('index', {userdirectories: userdirectories, user: request.user}))
  .catch(err => response.send('Booooooo'));
});


// LOGIN PAGE =====================================

// local login form
routes.get('/login', (req, res) => {
  //console.log('errors:', res.locals.getMessages());
  res.render('loginForm', { failed: req.query.failed });
});

// endpoint for local login sumbit
routes.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?failed=true',
    failureFlash: true
  })
);

// UNEMPLOYED USERS PAGE =====================================
routes.post('/unemployed', function(request, response) {
  User.find({job: null})
  .then(userdirectories => response.render('unemployed', {userdirectories: userdirectories}))
  .catch(err => response.send('Booooooo'));
});


// EMPLOYED USERS ============================================
routes.post('/employed', function(request, response) {

  User.find({job: {$nin: [null]}})
  .then(userdirectories => response.render('employed', {userdirectories: userdirectories}))
  .catch(err => response.send('Booooooo'));
});


// USER PAGE =================================================
routes.get('/users/:user', function(request, response) {
  let userName = request.params.user;

  User.find({username: userName})
  .then(userdirectories => response.render('user', {userdirectories: userdirectories}))
  .catch(err => response.send('Booooooo'));
});


// SEARCH RESULTS ============================================
routes.post('/search', function(request, response) {
  let search = request.body.search;

  User.find({$or: [{'address.country': search}, {skills: search}]})
  .then(userdirectories => response.render('searchResults', {userdirectories: userdirectories}))
  .catch(err => response.send('Booooooo'));
});


// REGISTRATION =============================================
routes.get('/signup', (req, res) => {
  res.render('registrationForm');
});

routes.post('/register', (req, res) => {
  let user = new User(req.body);
  user.provider = 'local';
  user.setPassword(req.body.password);

  user
    .save()
    // if good...
    .then(() => res.redirect('/'))
    // if bad...
    .catch(err => console.log(err));
});

// EDIT ACCOUNT =============================================
routes.get('/edit', (req, res) => {
  console.log(req.query.id);
  if (req.query.id) {
    User.findById(req.query.id)
    .then(user => res.render('edit', {user: user}))
  } else {
    console.log('Edit attempt failed');
    res.redirect('/');
  }
});

routes.post('/save', (req, res) => {
  console.log(req.body.id);
  if (req.body.id) {
    User.findByIdAndUpdate(req.body.id, req.body, { upsert: true })
    .then(() => res.redirect('/'));
  }

});


// LOG OUT ==================================================
routes.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = routes;
