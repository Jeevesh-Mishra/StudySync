const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getResourcesByGroup, createResource, deleteResource, resourceValidation } = require('../controllers/resourceController');

router.get('/group/:groupId', auth, getResourcesByGroup);
router.post('/', auth, resourceValidation, validate, createResource);
router.delete('/:id', auth, deleteResource);

module.exports = router;
