const Note = require('../models/Note');
const User = require('../models/User');
const { body } = require('express-validator');

const noteValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('group').notEmpty().withMessage('Group ID is required')
];

// GET /api/v1/notes/group/:groupId
const getNotesByGroup = async (req, res, next) => {
  try {
    const notes = await Note.find({ group: req.params.groupId })
      .populate('author', 'username avatar')
      .sort('-createdAt');
    res.json({ success: true, notes });
  } catch (err) { next(err); }
};

// POST /api/v1/notes
const createNote = async (req, res, next) => {
  try {
    const { title, content, group } = req.body;
    const note = await Note.create({ title, content, group, author: req.user._id });

    // Update contribution
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'contributions.notes': 1 }
    });
    const user = await User.findById(req.user._id);
    user.updateContributionScore();
    await user.save();

    await note.populate('author', 'username avatar');
    res.status(201).json({ success: true, note });
  } catch (err) { next(err); }
};

// PUT /api/v1/notes/:id
const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    ).populate('author', 'username avatar');

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, note });
  } catch (err) { next(err); }
};

// DELETE /api/v1/notes/:id
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) { next(err); }
};

module.exports = { getNotesByGroup, createNote, updateNote, deleteNote, noteValidation };
