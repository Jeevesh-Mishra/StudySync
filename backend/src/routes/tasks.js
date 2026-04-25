const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getTasksByGroup, createTask, updateTask, deleteTask, taskValidation } = require('../controllers/taskController');

router.get('/group/:groupId', auth, getTasksByGroup);
router.post('/', auth, taskValidation, validate, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
