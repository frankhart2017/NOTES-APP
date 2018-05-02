const mongoose = require('mongoose');

var NoteSchema = new mongoose.Schema({
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  note: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  }
});

var Note = mongoose.model('Note', NoteSchema);

module.exports = {Note};
