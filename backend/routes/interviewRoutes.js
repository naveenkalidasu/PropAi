const express = require('express');
const router = express.Router();
const {
  startInterview,
  getNextQuestion,
  submitAnswer,
  evaluateSingleAnswer,
  endInterview,
  getIndividualReport
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startInterview);
router.post('/question', protect, getNextQuestion);
router.post('/answer', protect, submitAnswer);
router.post('/evaluate', protect, evaluateSingleAnswer);
router.post('/end', protect, endInterview);
router.get('/report/:interviewId', protect, getIndividualReport);

module.exports = router;
