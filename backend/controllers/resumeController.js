const fs = require('fs');
const pdf = require('pdf-parse');
const Resume = require('../models/Resume');
const Profile = require('../models/Profile');
const Roadmap = require('../models/Roadmap');
const { analyzeResume, generateLearningRoadmap } = require('../services/llm');

// Upload resume & parse PDF text
const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
  }

  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    
    // Parse PDF
    let parsedData;
    try {
      parsedData = await pdf(dataBuffer);
    } catch (pdfErr) {
      console.error('PDF Parse Error:', pdfErr);
      return res.status(422).json({ 
        success: false, 
        message: 'Could not parse the PDF file format. Ensure it is not corrupted or password-protected.' 
      });
    }

    const text = parsedData.text || '';

    // Save Resume meta
    const resume = await Resume.create({
      user: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedText: text
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        extractedTextLength: text.length
      }
    });
  } catch (error) {
    console.error('Upload Controller Error:', error);
    res.status(500).json({ success: false, message: 'Server error during resume parsing' });
  }
};

// Analyze resume, compute ATS, find gaps, and generate learning roadmap
const analyzeUploadedResume = async (req, res) => {
  const { resumeId } = req.body;

  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume document not found' });
    }

    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this resume' });
    }

    // Fetch user's profile to know the target job
    const profile = await Profile.findOne({ user: req.user.id });
    const targetJob = profile ? profile.targetJob : 'Software Engineer';

    console.log(`🤖 Starting AI Analysis for Resume ID: ${resumeId} against target job: ${targetJob}`);

    // Call LLM for ATS/Gap Analysis
    const analysis = await analyzeResume(resume.extractedText, targetJob);

    // Save analysis and ATS score to resume document
    resume.atsScore = analysis.atsScore || 0;
    resume.analysis = {
      skills: analysis.skills || [],
      gaps: analysis.gaps || [],
      atsSuggestions: analysis.suggestions || []
    };
    await resume.save();

    // Auto-update profile skills with the newly discovered skills from resume
    if (profile && analysis.skills && analysis.skills.length > 0) {
      const existingSkillsSet = new Set(profile.skills || []);
      analysis.skills.forEach(skill => existingSkillsSet.add(skill));
      profile.skills = Array.from(existingSkillsSet);
      await profile.save();
    }

    // Auto-generate customized learning roadmap based on skills and gaps
    console.log(`🤖 Generating personalized study roadmap...`);
    const roadmapData = await generateLearningRoadmap(
      analysis.skills || [], 
      analysis.gaps || [], 
      targetJob
    );

    // Update or Create Roadmap
    let roadmap = await Roadmap.findOne({ user: req.user.id });
    if (roadmap) {
      roadmap.role = targetJob;
      roadmap.skillsToLearn = roadmapData.skillsToLearn || [];
      roadmap.modules = roadmapData.modules || [];
      roadmap.updatedAt = Date.now();
      await roadmap.save();
    } else {
      roadmap = await Roadmap.create({
        user: req.user.id,
        role: targetJob,
        skillsToLearn: roadmapData.skillsToLearn || [],
        modules: roadmapData.modules || []
      });
    }

    res.json({
      success: true,
      resume,
      roadmap
    });
  } catch (error) {
    console.error('Analyze Controller Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during resume AI analysis' });
  }
};

module.exports = { uploadResume, analyzeUploadedResume };
