const env = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken')


const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => { console.log(req.method, req.path); next(); }); // ← add this

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/rsvp',   require('./routes/rsvp'));
app.use('/api/orgs',   require('./routes/orgs'));
app.use('/api/users', require('./routes/users'));

//Making users
  const users = [{
    'name': username,
    'password': password
  }]

app.get('/users', (req, res) => {
  res.json(users)
})
//Authenicate User
app.get('/login', (req, res) => {
    
  const username = req.body.username
  const password = req.body.password


    
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
  res.json ({'accessToken': accessToken})
  })

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error(err));