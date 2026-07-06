const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true
  },
  skillsToLearn: {
    type: [String],
    default: []
  },
  modules: [{
    title: String,
    description: String,
    duration: String, // e.g. "Week 1"
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    topics: [{
      name: String,
      completed: {
        type: Boolean,
        default: false
      },
      resources: [String]
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
