const Discussion = require('../models/Discussion');

// GET /api/v1/discussions/group/:groupId
const getDiscussion = async (req, res, next) => {
  try {
    let discussion = await Discussion.findOne({ group: req.params.groupId });
    if (!discussion) {
      discussion = await Discussion.create({ group: req.params.groupId, messages: [] });
    }
    res.json({ success: true, discussion });
  } catch (err) { next(err); }
};

module.exports = { getDiscussion };
