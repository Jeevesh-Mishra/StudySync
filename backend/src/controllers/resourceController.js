const Resource = require('../models/Resource');
const { body } = require('express-validator');

const resourceValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('group').notEmpty().withMessage('Group ID is required')
];

// GET /api/v1/resources/group/:groupId
const getResourcesByGroup = async (req, res, next) => {
  try {
    const resources = await Resource.find({ group: req.params.groupId })
      .populate('addedBy', 'username avatar')
      .sort('-createdAt');
    res.json({ success: true, resources });
  } catch (err) { next(err); }
};

// POST /api/v1/resources
const createResource = async (req, res, next) => {
  try {
    const { title, url, type, description, group } = req.body;
    const resource = await Resource.create({
      title, url, type, description, group, addedBy: req.user._id
    });
    await resource.populate('addedBy', 'username avatar');
    res.status(201).json({ success: true, resource });
  } catch (err) { next(err); }
};

// DELETE /api/v1/resources/:id
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, message: 'Resource deleted' });
  } catch (err) { next(err); }
};

module.exports = { getResourcesByGroup, createResource, deleteResource, resourceValidation };
