const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {User} = require('./models/user');
var {Note} = require('./models/note')
var {authenticate} = require('./middleware/authenticate');

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
    res.status(400).send({e});
  });
});

//Logout route
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

//Add a new note route
app.post('/notes', authenticate, (req, res) => {
  var note = new Note({
    _creator: req.user._id,
    title: req.body.title,
    note: req.body.note
  });

  note.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  })
});

//Getting all notes of a user route
app.get('/notes', authenticate, (req, res) => {
  Note.find({
    _creator: req.user._id
  }).then((notes) => {
    res.send({notes})
  }, (e) => {
    res.status(400).send(e);
  });
});

//Getting a particular note by id route
app.get('/notes/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if(!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Note.findOne({
    _id: id,
    _creator: req.user._id
  }).then((note) => {
    if(!note) {
      return res.status(404).send();
    }

    res.send({note});
  }).catch((e) => {
    res.status(400).send();
  });
});

//Deleting a particular note by id route
app.delete('/notes/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if(!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Note.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((note) => {
    if(!note) {
      return res.status(404).send();
    }

    res.send(note);
  }).catch((e) => {
    res.send(400).send();
  });
});

//Updating a particular note by id route
app.patch('/notes/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['title', 'note']);

  if(!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Note.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {
    $set: body
  }, {
    new: true
  }).then((note) => {
    if(!note) {
      return res.status(404).send();
    }

    res.send({note});
  }).catch((e) => {
    res.status(400).send();
  })
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
