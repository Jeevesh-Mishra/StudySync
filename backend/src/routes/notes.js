const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getNotesByGroup, createNote, updateNote, deleteNote, noteValidation } = require('../controllers/noteController');

router.get('/group/:groupId', auth, getNotesByGroup);
router.post('/', auth, noteValidation, validate, createNote);
router.put('/:id', auth, updateNote);
router.delete('/:id', auth, deleteNote);

module.exports = router;
