const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
  scheduledAt: {
    type: Date, required: true
  },
  duration: {
    type: Number, default: 60 // minutes
  },
  description: {
    type: String, default: ''
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  notes: {
    type: String, default: ''
  },
  status: {
    type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming'
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
