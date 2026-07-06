const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: {
    type: [String],
    default: []
  },
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    graduationYear: Number
  }],
  targetJob: {
    type: String,
    required: true,
    default: 'Software Engineer'
  },
  summary: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);
