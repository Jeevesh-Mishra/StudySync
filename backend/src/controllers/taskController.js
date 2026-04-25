const Task = require('../models/Task');
const User = require('../models/User');
const { body } = require('express-validator');

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('group').notEmpty().withMessage('Group ID is required')
];

// GET /api/v1/tasks/group/:groupId
const getTasksByGroup = async (req, res, next) => {
  try {
    const tasks = await Task.find({ group: req.params.groupId })
      .populate('assignee', 'username avatar')
      .populate('createdBy', 'username avatar')
      .sort('-createdAt');
    res.json({ success: true, tasks });
  } catch (err) { next(err); }
};

// POST /api/v1/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, group, assignee, dueDate } = req.body;
    const task = await Task.create({
      title, description, group, assignee, dueDate, createdBy: req.user._id
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'contributions.tasks': 1 }
    });
    const user = await User.findById(req.user._id);
    user.updateContributionScore();
    await user.save();

    await task.populate('assignee', 'username avatar');
    await task.populate('createdBy', 'username avatar');
    res.status(201).json({ success: true, task });
  } catch (err) { next(err); }
};

// PUT /api/v1/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignee', 'username avatar')
      .populate('createdBy', 'username avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

// DELETE /api/v1/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

module.exports = { getTasksByGroup, createTask, updateTask, deleteTask, taskValidation };
