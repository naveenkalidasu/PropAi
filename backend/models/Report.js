const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['hr', 'technical', 'coding', 'mock'],
    required: true
  },
  role: {
    type: String,
    required: true
  },
  overallScore: {
    type: Number,
    required: true
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  improvementTips: {
    type: [String],
    default: []
  },
  finalRecommendation: {
    type: String,
    enum: ['HIRE', 'CONSIDER', 'REJECT'],
    default: 'CONSIDER'
  },
  detailedFeedback: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
