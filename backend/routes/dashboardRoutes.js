const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getPracticeQuestion,
  submitPracticeAnswer,
  toggleRoadmapTopic
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboardData);
router.get('/practice/generate', protect, getPracticeQuestion);
router.post('/practice/submit', protect, submitPracticeAnswer);
router.put('/roadmap/topic', protect, toggleRoadmapTopic);

module.exports = router;
