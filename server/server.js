const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {User} = require('./models/user');

var app = express();
const port = 3000;

app.use(bodyParser.json());

//Signup route
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['name', 'email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e.message);
  });
});

//Login route
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  });
});

//Logout route

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
