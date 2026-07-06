const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['hr', 'technical', 'coding'],
    required: true
  },
  role: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  suggestedAnswer: {
    type: String,
    default: ''
  },
  // Specific for coding round
  codingTemplate: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  testCases: [{
    input: String,
    output: String,
    isPublic: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
