const Dataset = require('../models/Dataset');
const User = require('../models/User');
const { compressFile, UPLOAD_DIR, readCompressedFile } = require('../utils/fileHandler');
const { getDatasetPreview } = require('../utils/csvParser');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

// POST /api/v1/datasets/upload
const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description, tags } = req.body;
    const tagsArray = tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [];

    // Compress the uploaded file using streams + zlib
    const originalPath = req.file.path;
    const compressedPath = await compressFile(originalPath);

    const dataset = await Dataset.create({
      title,
      description,
      tags: tagsArray,
      filePath: compressedPath,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      compressed: true,
      uploader: req.user._id
    });

    // Update contribution
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'contributions.datasets': 1 }
    });
    const user = await User.findById(req.user._id);
    user.updateContributionScore();
    await user.save();

    await dataset.populate('uploader', 'username avatar');
    res.status(201).json({ success: true, dataset });
  } catch (err) { next(err); }
};

// GET /api/v1/datasets
const getDatasets = async (req, res, next) => {
  try {
    const { search, tag, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (tag) {
      query.tags = { $in: tag.split(',').map(t => t.trim().toLowerCase()) };
    }

    const datasets = await Dataset.find(query)
      .populate('uploader', 'username avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Dataset.countDocuments(query);

    res.json({ success: true, datasets, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/v1/datasets/:id
const getDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id)
      .populate('uploader', 'username avatar')
      .populate('comments.user', 'username avatar');

    if (!dataset) return res.status(404).json({ success: false, message: 'Dataset not found' });

    // Increment views
    dataset.views += 1;
    await dataset.save();

    res.json({ success: true, dataset });
  } catch (err) { next(err); }
};

// GET /api/v1/datasets/:id/preview
const previewDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return res.status(404).json({ success: false, message: 'Dataset not found' });

    const preview = await getDatasetPreview(dataset.filePath, dataset.mimeType, dataset.compressed);
    res.json({ success: true, preview });
  } catch (err) { next(err); }
};

// GET /api/v1/datasets/download/:id
const downloadDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return res.status(404).json({ success: false, message: 'Dataset not found' });

    if (!fs.existsSync(dataset.filePath)) {
      return res.status(404).json({ success: false, message: 'File no longer exists on the server' });
    }

    dataset.downloads += 1;
    await dataset.save();

    if (dataset.compressed) {
      // Decompress and stream to client
      res.setHeader('Content-Disposition', `attachment; filename="${dataset.originalName}"`);
      res.setHeader('Content-Type', dataset.mimeType || 'application/octet-stream');

      const readStream = fs.createReadStream(dataset.filePath);
      readStream.on('error', (err) => next(err));
      
      const gunzip = zlib.createGunzip();
      gunzip.on('error', (err) => next(err));

      readStream.pipe(gunzip).pipe(res);
    } else {
      res.download(dataset.filePath, dataset.originalName, (err) => {
        if (err) next(err);
      });
    }
  } catch (err) { next(err); }
};

// POST /api/v1/datasets/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return res.status(404).json({ success: false, message: 'Dataset not found' });

    dataset.comments.push({
      user: req.user._id,
      username: req.user.username,
      text
    });
    await dataset.save();

    await dataset.populate('comments.user', 'username avatar');
    res.json({ success: true, comments: dataset.comments });
  } catch (err) { next(err); }
};

// GET /api/v1/datasets/tags/all
const getAllTags = async (req, res, next) => {
  try {
    const tags = await Dataset.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);
    res.json({ success: true, tags: tags.map(t => ({ name: t._id, count: t.count })) });
  } catch (err) { next(err); }
};

// DELETE /api/v1/datasets/:id
const deleteDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return res.status(404).json({ success: false, message: 'Dataset not found' });

    // Only the uploader or an admin can delete
    const isOwner = dataset.uploader.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this dataset' });
    }

    // Delete the file from disk
    if (dataset.filePath && fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
    }

    await Dataset.findByIdAndDelete(req.params.id);

    // Decrement contribution count
    await User.findByIdAndUpdate(dataset.uploader, {
      $inc: { 'contributions.datasets': -1 }
    });
    const user = await User.findById(dataset.uploader);
    if (user) {
      user.updateContributionScore();
      await user.save();
    }

    res.json({ success: true, message: 'Dataset deleted' });
  } catch (err) { next(err); }
};

module.exports = { uploadDataset, getDatasets, getDataset, previewDataset, downloadDataset, addComment, getAllTags, deleteDataset };
