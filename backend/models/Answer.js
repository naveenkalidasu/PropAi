const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewId: {
    type: String,
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['hr', 'technical', 'coding'],
    required: true
  },
  answerText: {
    type: String,
    required: true
  },
  codeLanguage: {
    type: String,
    default: ''
  },
  evaluation: {
    score: {
      type: Number,
      default: 0 // score out of 100
    },
    comments: {
      type: String,
      default: ''
    },
    strengths: [String],
    weaknesses: [String],
    correctAnswerSuggested: {
      type: String,
      default: ''
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Answer', AnswerSchema);
