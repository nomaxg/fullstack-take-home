const express = require('express');
const cors = require('cors');
const courseRoutes = require('./routes/courses.js');
const authRoutes = require('./routes/auth.js');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/', courseRoutes);
app.use('/', authRoutes);

// Split out app and server so that we can test with Jest
module.exports = app;
