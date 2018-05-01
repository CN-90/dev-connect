const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')

const app = express();

//passport middleware
app.use(passport.initialize());
//passport Config
require('./config/passport')(passport);

//bodyPaser middleware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = require('./config/keys').mongoURL;

mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

const port = process.env.PORT || 5000;

app.get('/', (req, res) => res.send("Hello there!"))

app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

app.listen(port, () => console.log(`Server is running on port ${port}`))