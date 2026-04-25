const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDiscussion } = require('../controllers/discussionController');

router.get('/group/:groupId', auth, getDiscussion);

module.exports = router;
