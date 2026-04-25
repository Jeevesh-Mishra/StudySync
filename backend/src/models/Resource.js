const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true
  },
  url: {
    type: String, default: ''
  },
  type: {
    type: String, enum: ['link', 'pdf', 'video', 'document', 'other'], default: 'link'
  },
  description: {
    type: String, default: ''
  },
  group: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
