const express = require('express');
const handlebars = require('express-handlebars');
const usersRoutes = require('./routes/users');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
mongoose.Promise = bluebird;

const app = express();

app.engine('handlebars', handlebars());
app.set('views', './views');
app.set('view engine', 'handlebars');


app.use(
  session({
    secret: 'keyboard kitten',
    resave: false,
    saveUninitialized: true
  })
);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// load static files in public folder
app.use(express.static('public'));

// Use my routing file
app.use('/', usersRoutes);


mongoose
  // connect to mongo via mongoose
  .connect('mongodb://localhost:27017/newdb', { useMongoClient: true })
  // now we can do whatever we want with mongoose.
  // configure session support middleware with express-session
  .then(() => app.listen(3000, () => console.log('ready to roll!!')));
