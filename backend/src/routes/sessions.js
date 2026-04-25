const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getSessionsByGroup, createSession, joinSession, deleteSession, sessionValidation } = require('../controllers/sessionController');

router.get('/group/:groupId', auth, getSessionsByGroup);
router.post('/', auth, sessionValidation, validate, createSession);
router.put('/:id/join', auth, joinSession);
router.delete('/:id', auth, deleteSession);

module.exports = router;
