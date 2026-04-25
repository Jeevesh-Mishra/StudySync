const Session = require('../models/Session');
const User = require('../models/User');
const { body } = require('express-validator');

const sessionValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('group').notEmpty().withMessage('Group ID is required'),
  body('scheduledAt').notEmpty().withMessage('Schedule date is required')
];

// GET /api/v1/sessions/group/:groupId
const getSessionsByGroup = async (req, res, next) => {
  try {
    const sessions = await Session.find({ group: req.params.groupId })
      .populate('scheduledBy', 'username avatar')
      .populate('participants', 'username avatar')
      .sort('scheduledAt');
    res.json({ success: true, sessions });
  } catch (err) { next(err); }
};

// POST /api/v1/sessions
const createSession = async (req, res, next) => {
  try {
    const { title, group, scheduledAt, duration, description } = req.body;
    const session = await Session.create({
      title, group, scheduledAt, duration, description,
      scheduledBy: req.user._id,
      participants: [req.user._id]
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'contributions.sessions': 1 }
    });
    const user = await User.findById(req.user._id);
    user.updateContributionScore();
    await user.save();

    await session.populate('scheduledBy', 'username avatar');
    await session.populate('participants', 'username avatar');
    res.status(201).json({ success: true, session });
  } catch (err) { next(err); }
};

// PUT /api/v1/sessions/:id/join
const joinSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (!session.participants.includes(req.user._id)) {
      session.participants.push(req.user._id);
      await session.save();
    }

    await session.populate('scheduledBy', 'username avatar');
    await session.populate('participants', 'username avatar');
    res.json({ success: true, session });
  } catch (err) { next(err); }
};

// DELETE /api/v1/sessions/:id
const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) { next(err); }
};

module.exports = { getSessionsByGroup, createSession, joinSession, deleteSession, sessionValidation };
