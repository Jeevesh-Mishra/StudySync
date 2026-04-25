const jwt = require('jsonwebtoken');
const Discussion = require('../models/Discussion');
const User = require('../models/User');
const Dataset = require('../models/Dataset');

const initializeSockets = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

    // ─── GROUP CHAT ───
    socket.on('join-group', (groupId) => {
      socket.join(`group:${groupId}`);
      console.log(`${socket.user.username} joined group:${groupId}`);
    });

    socket.on('leave-group', (groupId) => {
      socket.leave(`group:${groupId}`);
    });

    socket.on('group-message', async ({ groupId, content }) => {
      try {
        const message = {
          sender: socket.user._id,
          senderName: socket.user.username,
          content,
          timestamp: new Date()
        };

        // Persist to database
        let discussion = await Discussion.findOne({ group: groupId });
        if (!discussion) {
          discussion = await Discussion.create({ group: groupId, messages: [] });
        }
        discussion.messages.push(message);
        await discussion.save();

        // Update contribution
        await User.findByIdAndUpdate(socket.user._id, {
          $inc: { 'contributions.messages': 1 }
        });

        // Broadcast to room
        io.to(`group:${groupId}`).emit('new-message', {
          ...message,
          sender: { _id: socket.user._id, username: socket.user.username, avatar: socket.user.avatar }
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── DATASET DISCUSSION ───
    socket.on('join-dataset', (datasetId) => {
      socket.join(`dataset:${datasetId}`);
    });

    socket.on('leave-dataset', (datasetId) => {
      socket.leave(`dataset:${datasetId}`);
    });

    socket.on('dataset-comment', async ({ datasetId, text }) => {
      try {
        const dataset = await Dataset.findById(datasetId);
        if (!dataset) return;

        const comment = {
          user: socket.user._id,
          username: socket.user.username,
          text,
          timestamp: new Date()
        };

        dataset.comments.push(comment);
        await dataset.save();

        io.to(`dataset:${datasetId}`).emit('new-dataset-comment', {
          ...comment,
          user: { _id: socket.user._id, username: socket.user.username, avatar: socket.user.avatar }
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to add comment' });
      }
    });

    // ─── NOTIFICATIONS ───
    socket.on('join-notifications', () => {
      socket.join(`user:${socket.user._id}`);
    });

    // ─── DISCONNECT ───
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.username}`);
    });
  });
};

module.exports = initializeSockets;
