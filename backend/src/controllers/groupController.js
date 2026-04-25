const Group = require('../models/Group');
const Discussion = require('../models/Discussion');
const { body } = require('express-validator');

const createValidation = [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required')
];

// GET /api/v1/groups
const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar')
      .sort('-createdAt');
    res.json({ success: true, groups });
  } catch (err) { next(err); }
};

// GET /api/v1/groups/all
const getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.find()
      .populate('owner', 'username avatar')
      .sort('-createdAt');
    res.json({ success: true, groups });
  } catch (err) { next(err); }
};

// POST /api/v1/groups
const createGroup = async (req, res, next) => {
  try {
    const { name, subject, description } = req.body;
    const group = await Group.create({ name, subject, description, owner: req.user._id });

    // Create discussion channel for the group
    await Discussion.create({ group: group._id, messages: [] });

    await group.populate('owner', 'username avatar');
    await group.populate('members', 'username avatar');

    res.status(201).json({ success: true, group });
  } catch (err) { next(err); }
};

// POST /api/v1/groups/join
const joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!group) {
      return res.status(404).json({ success: false, message: 'Invalid invite code' });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    group.members.push(req.user._id);
    await group.save();

    await group.populate('owner', 'username avatar');
    await group.populate('members', 'username avatar');

    res.json({ success: true, group });
  } catch (err) { next(err); }
};

// GET /api/v1/groups/:id
const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar contributionScore');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    res.json({ success: true, group });
  } catch (err) { next(err); }
};

// PUT /api/v1/groups/:id
const updateGroup = async (req, res, next) => {
  try {
    const { name, subject, description } = req.body;
    let group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this group' });
    }

    group.name = name;
    group.subject = subject;
    if (description !== undefined) group.description = description;

    await group.save();
    
    await group.populate('owner', 'username avatar');
    await group.populate('members', 'username avatar contributionScore');

    res.json({ success: true, group });
  } catch (err) { next(err); }
};

// POST /api/v1/groups/:id/leave
const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Group owner cannot leave. Delete the group instead.' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You are not a member of this group.' });
    }

    group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
    await group.save();

    res.json({ success: true, message: 'Successfully left the group.' });
  } catch (err) { next(err); }
};

// DELETE /api/v1/groups/:id/members/:memberId
const removeMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the group owner can remove members.' });
    }

    if (group.owner.toString() === req.params.memberId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the group owner.' });
    }

    if (!group.members.includes(req.params.memberId)) {
      return res.status(400).json({ success: false, message: 'User is not a member of this group.' });
    }

    group.members = group.members.filter(m => m.toString() !== req.params.memberId);
    await group.save();

    res.json({ success: true, message: 'Member removed successfully.' });
  } catch (err) { next(err); }
};

module.exports = { getGroups, getAllGroups, createGroup, joinGroup, getGroup, updateGroup, leaveGroup, removeMember, createValidation };
