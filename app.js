const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const custRoute = require('./routes/custRoutes');
const empRoute = require('./routes/empRoutes');
const mngRoute = require('./routes/mngRoutes');
const customerDeserializeUser = require('./middleware/des');
const employeeDeserializeUser = require('./middleware/desEmp');
const managerDeserializeUser = require('./middleware/desMng');
const app = express();

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: false
}));

// Middleware for customer routes
app.use('/cust', customerDeserializeUser);

// Middleware for employee routes
app.use('/emp', employeeDeserializeUser);

// Middleware for manager routes
app.use('/mng', managerDeserializeUser);

// Redirect root URL to customer routes
app.get('/', (req, res) => {
    res.redirect('/cust');
});

app.use('/cust', custRoute); // Customer routes
app.use('/emp', empRoute);   // Employee routes
app.use('/mng', mngRoute);   // Manager routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
