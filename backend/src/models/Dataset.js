const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const datasetSchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true
  },
  description: {
    type: String, default: ''
  },
  tags: [{
    type: String, trim: true, lowercase: true
  }],
  filePath: {
    type: String, required: true
  },
  originalName: {
    type: String, required: true
  },
  fileSize: {
    type: Number, default: 0
  },
  mimeType: {
    type: String, default: ''
  },
  compressed: {
    type: Boolean, default: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
  downloads: {
    type: Number, default: 0
  },
  views: {
    type: Number, default: 0
  },
  comments: [commentSchema]
}, { timestamps: true });

datasetSchema.index({ title: 'text', description: 'text' });
datasetSchema.index({ tags: 1 });

module.exports = mongoose.model('Dataset', datasetSchema);
