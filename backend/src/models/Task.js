const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true
  },
  description: {
    type: String, default: ''
  },
  group: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
  status: {
    type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending'
  },
  dueDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
