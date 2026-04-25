const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const discussionSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true
  },
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Discussion', discussionSchema);
