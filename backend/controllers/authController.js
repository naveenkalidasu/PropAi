const User = require('../models/User');
const Profile = require('../models/Profile');
const Report = require('../models/Report');
const Resume = require('../models/Resume');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register candidate
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'candidate'
    });

    // Initialize Profile for this user
    await Profile.create({
      user: user._id,
      skills: [],
      experience: [],
      education: [],
      targetJob: 'Software Engineer',
      summary: ''
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'name email role');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  const { skills, experience, education, targetJob, summary } = req.body;

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    profile.skills = skills || profile.skills;
    profile.experience = experience || profile.experience;
    profile.education = education || profile.education;
    profile.targetJob = targetJob || profile.targetJob;
    profile.summary = summary || profile.summary;
    profile.updatedAt = Date.now();

    await profile.save();

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    // Fetch target job role for each user to enrich statistics
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const profile = await Profile.findOne({ user: u._id });
        const reports = await Report.find({ user: u._id });
        const latestResume = await Resume.findOne({ user: u._id }).sort({ createdAt: -1 });
        
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          targetJob: profile ? profile.targetJob : 'N/A',
          interviewsCount: reports.length,
          avgScore: reports.length > 0 
            ? Math.round(reports.map(r => r.overallScore).reduce((a, b) => a + b, 0) / reports.length) 
            : 0,
          atsScore: latestResume ? latestResume.atsScore : 0
        };
      })
    );

    res.json({ success: true, users: enrichedUsers });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
};

module.exports = { register, login, getProfile, updateProfile, getAllUsers };
