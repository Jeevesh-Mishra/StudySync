const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true
  },
  content: {
    type: String, default: ''
  },
  group: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
  summary: {
    type: String, default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
