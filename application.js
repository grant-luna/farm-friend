require('dotenv').config();
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
    createTableIfMissing: true,
    tableName: 'session',
  }),
  name: 'ffps-session',
  saveUninitialized: false,
  resave: false,
  secret: process.env.SESSIONSECRET,
}));

// Initialize Persistence
const PgPersistence = require('./lib/pg-persistence');

app.use((request, response, next) => {
  response.locals.store = new PgPersistence();
  next();
});

// Request Body Parsing Configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Error Handling
const catchError = require('./lib/catch-error');

// Route Handling Methods
app.get('/', (request, response, next) => {
  response.redirect('/sign-up');
});

app.get('/search', (request, response, next) => {
  response.render('search');
});

app.post('/search', catchError(async (request, response, next) => {
  const search = await response.locals.store.saveSearchToDatabase(request.session.email, request.body);
  if (!search) throw new Error('Unable to generate your requested search');

  response.redirect('/search');
}));

app.get('/searches', (request, response, next) => {
  response.render('searches');
});

app.get('/sign-in', (request, response, next) => {
  console.log('hello');
  response.render('sign-in')
});

app.post('/sign-in', catchError(async (request, response, next) => {
  const email = request.body.email;
  const password = request.body.password;

  const authenticated = await response.locals.store.authenticate(email, password);
  
  if (!authenticated) {
    request.flash('error', 'Incorrect Email + Password combination');

    response.render('sign-in', {
      email,
      password,
      errorMessages: request.flash('error'),
    });
  } else {
    request.session.email = email;
    request.session.signedIn = true;

    response.redirect('/searches')
  }
}));

app.post('/sign-out', (request, response, next) => {
  delete request.session.email
  delete request.session.signedIn

  response.redirect('/sign-in');
});

app.get('/sign-up', (request, response, next) => {
  response.render('sign-up')
});

// Initialize Form Submission Validators
const {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
} = require('./lib/validation-chains');

// Create Password Hashing Functionality
const hashPassword = require('./lib/hash-password');

// Form Submition Request
app.post('/sign-up', [
  validateFirstName(),
  validateLastName(),
  validateEmail(),
  validatePassword(),
], catchError(async (request, response, next) => {
  const firstName = request.body.firstName;
  const lastName = request.body.lastName;
  const email = request.body.email;
  const password = request.body.password

  const errors = validationResult(request);
  
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => request.flash('error', error.msg));

    response.render('sign-up', {
      firstName,
      lastName,
      email,
      password,
      errorMessages: request.flash().error,
    });
  } else {
    const hashedPassword = await hashPassword(password);
    const userInputs = { firstName, lastName, email, password: hashedPassword };
    const newUser = await response.locals.store.createNewUser(userInputs);
    if (!newUser) throw new Error('Error creating a new user');

    request.session.email = email;
    request.session.signedIn = true;
    response.redirect('/searches')
  }
}));

// Custom Error Handler
app.use((error, request, response, next) => {
  if (error instanceof Error) {
    console.log(error.message);
    response.status(500).send(error.message);
  } else {
    console.log('An error occurred in the application');
    response.status(500).send('An unexpected error occurred');
  }
});

// Configure App Listening
app.listen(process.env.PORT, process.env.HOST, () => {
  console.log('Listening on Port 3000');
});

