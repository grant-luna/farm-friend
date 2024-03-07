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
  database: 'farm-friend',
  max: 20,
});

app.use(session({
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: false,
    path: '/',
  },
  store: new pgSession({
    pool: pgPool,
    createTableIfMissing: true,
    tableName: 'session',
  }),
  name: 'farm-friend-session',
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

// Authenticate Users
const authenticateUser = (request, response, next) => {
  if (request.session.signedIn === true) {
    next();
  } else {
    response.redirect(302, '/sign-in');
  }
};

// Make the session available to all views
app.use((request, response, next) => {
  response.locals.session = request.session;
  next();
})

// Route Handling Methods
app.get('/', authenticateUser, (request, response, next) => {
  response.render('home');
});

app.get('/account-dropdown-menu-items', authenticateUser, (request, response, next) => {
  response.render('account-dropdown-menu');
});

const reformatCallLogDates = require('./lib/reformat-call-log-dates.js');
app.get('/call-logs/:searchId/:rowId', authenticateUser, catchError(async (request, response, next) => {
  const searchId = request.params.searchId;
  const rowId = request.params.rowId;
  const search = await response.locals.store.findSearchBySearchId(searchId);
  if (!search) throw new Error('Unable to locate a search for the given ID');
  const callLogs = search.find((row) => Number(row.data.id) === Number(rowId)).data.callLogs;

  response.render('call-logs', { callLogs: reformatCallLogDates(callLogs) });
}));

app.get('/fetch-fps-window', authenticateUser, (request, response, next) => {
  response.render('fps-window');
});

app.get('/mapme', authenticateUser, (request, response, next) => {
  response.render('mapme', { googleMapsApiKey: process.env['GOOGLEMAPSAPI'] });
});

app.get('/newSearchWindow', authenticateUser, (request, response, next) => {
  response.render('create-search-menu');
});

// Displaying a Single Search
app.get('/search/:searchId', authenticateUser, catchError(async (request, response, next) => {
  const FileReformatter = require('./lib/file-reformatter');
  const searchId = request.params.searchId;
  const search = await response.locals.store.findSearchBySearchId(searchId);
  if (!search) throw new Error('Unable to locate a search for the given ID');
  const reformattedSearch = FileReformatter.prepareForDisplay(search);
  
  response.render('search', { reformattedSearch });
}));

app.delete('/search/:searchId', authenticateUser, catchError(async (request, response, next) => {
  const searchId = request.params.searchId;
  const deleteResponse = await response.locals.store.deleteSearch(searchId);
  if (!deleteResponse) throw new Error('Unable to delete the requested search');
  
  response.status(204).end();
}));

app.put('/updateSearch/:searchId', authenticateUser, catchError(async (request, response, next) => {
  const searchId = request.params.searchId;
  const searchData = request.body;
  
  const searchUpdated = await response.locals.store.updateSearchData(searchId, searchData);
  if (!searchUpdated) throw new Error('Unable to update search data');

  response.status(200).end();
}));

app.get('/search-data/:searchId', authenticateUser, catchError(async (request, response, next) => {
  const searchId = request.params.searchId;
  const search = await response.locals.store.findSearchBySearchId(searchId);
  if (!search) throw new Error('Unable to locate a search for the given ID');

  response.json(search);
}));

// Creating a New Search
const { v4: uuidv4 } = require('uuid');
app.post('/search', catchError(async (request, response, next) => {
  const userEmail = request.session.email;
  const fileName = request.body.fileNameInput;
  const parsedCsvString = request.body.parsedCsvString;

  const searchId = uuidv4();

  const search = await response.locals.store.saveSearchToDatabase(searchId, userEmail, fileName, parsedCsvString);
  if (!search) throw new Error('Unable to generate your requested search');

  response.redirect(`/search/${searchId}`);
}));

// Displaying a List of a User's Searches
app.get('/searches', authenticateUser, catchError(async (request, response, next) => {
  const userSearches = await response.locals.store.findUserSearches(request.session.email);
  if (!userSearches) throw new Error('Unable to locate user searches');
  
  response.render('searches', { userSearches });
}));

// Display the Sign-In Page
app.get('/sign-in', (request, response, next) => {
  response.render('sign-in')
});

// Sign-in an Existing User
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

// Sign-Out an Existing User
app.post('/sign-out', (request, response, next) => {
  delete request.session.email;
  delete request.session.signedIn;

  response.redirect('/sign-in');
});

// Display the Sign-Up Page
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

