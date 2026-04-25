const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getGroups, getAllGroups, createGroup, joinGroup, getGroup, updateGroup, leaveGroup, removeMember, createValidation } = require('../controllers/groupController');

router.get('/', auth, getGroups);
router.get('/all', auth, getAllGroups);
router.post('/', auth, createValidation, validate, createGroup);
router.post('/join', auth, joinGroup);
router.get('/:id', auth, getGroup);
router.put('/:id', auth, createValidation, validate, updateGroup);
router.post('/:id/leave', auth, leaveGroup);
router.delete('/:id/members/:memberId', auth, removeMember);

module.exports = router;
