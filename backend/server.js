<<<<<<< Myles-Branch
const env = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken')
=======
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

>>>>>>> main

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => { console.log(req.method, req.path); next(); }); // ← add this

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/rsvp',   require('./routes/rsvp'));
app.use('/api/orgs',   require('./routes/orgs'));
<<<<<<< Myles-Branch
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo connected")
=======

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
>>>>>>> main
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error(err));