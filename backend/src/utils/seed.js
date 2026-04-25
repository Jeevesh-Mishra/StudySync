require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Group = require('../models/Group');
const Discussion = require('../models/Discussion');
const Note = require('../models/Note');
const Task = require('../models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studysync';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Group.deleteMany({});
    await Discussion.deleteMany({});
    await Note.deleteMany({});
    await Task.deleteMany({});

    // Create users
    const users = await User.create([
      { username: 'alice', email: 'alice@test.com', password: 'password123', role: 'admin', contributions: { notes: 5, messages: 20, tasks: 3, datasets: 2, sessions: 1 } },
      { username: 'bob', email: 'bob@test.com', password: 'password123', role: 'member', contributions: { notes: 3, messages: 15, tasks: 2, datasets: 1, sessions: 2 } },
      { username: 'charlie', email: 'charlie@test.com', password: 'password123', role: 'member', contributions: { notes: 1, messages: 8, tasks: 1, datasets: 0, sessions: 0 } }
    ]);

    // Update contribution scores
    for (const user of users) {
      user.updateContributionScore();
      await user.save();
    }

    // Create groups
    const groups = await Group.create([
      { name: 'Machine Learning Study', subject: 'Computer Science', description: 'Deep dive into ML algorithms and neural networks', owner: users[0]._id, members: [users[0]._id, users[1]._id, users[2]._id] },
      { name: 'Data Structures', subject: 'Computer Science', description: 'Master arrays, trees, graphs and algorithms', owner: users[1]._id, members: [users[1]._id, users[0]._id] },
      { name: 'Web Development', subject: 'Technology', description: 'Full-stack web development with Node.js', owner: users[0]._id, members: [users[0]._id, users[2]._id] }
    ]);

    // Create discussions
    for (const group of groups) {
      await Discussion.create({
        group: group._id,
        messages: [
          { sender: users[0]._id, senderName: 'alice', content: `Welcome to ${group.name}!`, timestamp: new Date() },
          { sender: users[1]._id, senderName: 'bob', content: 'Excited to start learning!', timestamp: new Date() }
        ]
      });
    }

    // Create notes
    await Note.create([
      { title: 'Introduction to Neural Networks', content: 'Neural networks are computing systems inspired by biological neural networks. They consist of layers of interconnected nodes...', group: groups[0]._id, author: users[0]._id },
      { title: 'Binary Search Trees', content: 'A BST is a node-based binary tree data structure with the property that the left subtree contains only nodes with keys less than the parent...', group: groups[1]._id, author: users[1]._id },
      { title: 'REST API Design', content: 'RESTful APIs use HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove). Use proper status codes and versioning...', group: groups[2]._id, author: users[0]._id }
    ]);

    // Create tasks
    await Task.create([
      { title: 'Complete CNN assignment', description: 'Implement a convolutional neural network for image classification', group: groups[0]._id, assignee: users[1]._id, createdBy: users[0]._id, status: 'pending', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { title: 'Practice sorting algorithms', description: 'Implement quicksort, mergesort, and heapsort', group: groups[1]._id, assignee: users[0]._id, createdBy: users[1]._id, status: 'in-progress', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }
    ]);

    console.log('✅ Seed data created successfully!');
    console.log(`   - ${users.length} users`);
    console.log(`   - ${groups.length} groups`);
    console.log('   - Discussions, notes, and tasks created');
    console.log('\n   Test login: alice@test.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
