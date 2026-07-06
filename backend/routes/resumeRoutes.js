const express = require('express');
const router = express.Router();
const { uploadResume, analyzeUploadedResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/analyze', protect, analyzeUploadedResume);

module.exports = router;
