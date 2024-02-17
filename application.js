const express = require('express');
const app = express();

app.set('view engine', 'pug');

// Configure Logging
const morgan = require('morgan');
app.use(morgan('common'));

