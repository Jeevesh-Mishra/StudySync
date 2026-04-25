const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String, required: true, trim: true
  },
  subject: {
    type: String, required: true, trim: true
  },
  description: {
    type: String, default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  inviteCode: {
    type: String, unique: true
  }
}, { timestamps: true });

groupSchema.pre('save', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  if (this.members.length === 0 || !this.members.includes(this.owner)) {
    this.members.addToSet(this.owner);
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);
