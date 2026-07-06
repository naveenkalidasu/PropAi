const mongoose = require('mongoose');

const PracticeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  category: {
    type: String, // e.g. "React Hooks", "Mongoose validations"
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  evaluation: {
    score: Number, // out of 10
    feedback: String,
    modelAnswer: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Practice', PracticeSchema);
