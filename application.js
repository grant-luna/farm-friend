const express = require('express');
const app = express();

// Configure View Engine
app.set('view engine', 'pug');
app.set('views', ['./views', './views/components']);

// Configure Logging
const morgan = require('morgan');
app.use(morgan('common'));

// Configure Static Files
app.use(express.static('public'));

// Validation Configuration (express-validator)
const { check, validationResult } = require('express-validator');

// Flash Message Configuration
const flash = require('express-flash');
app.use(flash());

// Session Configuration
const session = require('express-session');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);

const pgPool = new pg.Pool({
  database: 'ffps',
  max: 20,
});

app.use(session({
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false,
    path: '/',
  },
  store: new pgSession({
    pool: pgPool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  name: 'ffps-session',
  saveUninitialized: false,
  resave: false,
  secret: 'This is not very secret',
}));

// Initialize Persistence
const PgPersistence = require('./lib/pg-persistence');

app.use((request, response, next) => {
  response.locals.store = new PgPersistence();
  next();
});

// Request Body Parsing Configuration
app.use(express.json());
app.use(express.urlencoded());

// Error Handling
const catchError = require('./lib/catch-error');

// Route Handling Methods
app.get('/', (request, response, next) => {
  response.send('Hello there');
});

app.use((error, request, response, next) => {
  console.log(error.message);
});

// Configure App Listening
app.listen(3000, 'localhost', () => {
  console.log('Listening on Port 3000');
});

