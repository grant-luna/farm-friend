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

