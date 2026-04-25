const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, trim: true, minlength: 3
  },
  email: {
    type: String, required: true, unique: true, trim: true, lowercase: true
  },
  password: {
    type: String, required: true, minlength: 6
  },
  avatar: {
    type: String, default: ''
  },
  role: {
    type: String, enum: ['admin', 'owner', 'member'], default: 'member'
  },
  contributions: {
    notes: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    tasks: { type: Number, default: 0 },
    datasets: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 }
  },
  contributionScore: {
    type: Number, default: 0
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateContributionScore = function () {
  const c = this.contributions;
  this.contributionScore = (c.notes * 10) + (c.messages * 2) + (c.tasks * 8) + (c.datasets * 15) + (c.sessions * 5);
  return this.contributionScore;
};

module.exports = mongoose.model('User', userSchema);
