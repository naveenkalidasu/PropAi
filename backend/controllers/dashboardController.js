const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const Roadmap = require('../models/Roadmap');
const Report = require('../models/Report');
const Practice = require('../models/Practice');
const { generatePracticeQuestion, evaluateAnswer } = require('../services/llm');

// Retrieve all stats and overview data for the progress dashboard
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch collections in parallel
    const [profile, latestResume, roadmap, reports, practiceList] = await Promise.all([
      Profile.findOne({ user: userId }),
      Resume.findOne({ user: userId }).sort({ createdAt: -1 }),
      Roadmap.findOne({ user: userId }),
      Report.find({ user: userId }).sort({ createdAt: -1 }),
      Practice.find({ user: userId }).sort({ createdAt: -1 })
    ]);

    // Calculate aggregated metrics
    const totalInterviews = reports.length;
    const scores = reports.map(r => r.overallScore);
    const averageScore = totalInterviews > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / totalInterviews) 
      : 0;

    // Calculate roadmap progress
    let roadmapProgress = 0;
    if (roadmap && roadmap.modules && roadmap.modules.length > 0) {
      let totalTopics = 0;
      let completedTopics = 0;
      roadmap.modules.forEach(mod => {
        if (mod.topics) {
          totalTopics += mod.topics.length;
          completedTopics += mod.topics.filter(t => t.completed).length;
        }
      });
      roadmapProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    }

    // Collect list of weak areas across reports to display on dashboard
    let aggregatedWeakAreas = [];
    reports.forEach(r => {
      if (r.weaknesses) {
        aggregatedWeakAreas.push(...r.weaknesses);
      }
    });
    // Deduplicate and limit to top 5
    aggregatedWeakAreas = Array.from(new Set(aggregatedWeakAreas)).slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalInterviews,
        averageScore,
        roadmapProgress,
        practiceCompleted: practiceList.length,
        targetJob: profile ? profile.targetJob : 'Software Engineer',
        atsScore: latestResume ? latestResume.atsScore : 0
      },
      profile,
      latestResume: latestResume ? {
        id: latestResume._id,
        fileName: latestResume.fileName,
        atsScore: latestResume.atsScore,
        analysis: latestResume.analysis,
        createdAt: latestResume.createdAt
      } : null,
      roadmap,
      reports: reports.map(r => ({
        id: r._id,
        interviewId: r.interviewId,
        type: r.type,
        role: r.role,
        overallScore: r.overallScore,
        finalRecommendation: r.finalRecommendation,
        createdAt: r.createdAt
      })),
      weakAreas: aggregatedWeakAreas,
      recentPractice: practiceList.slice(0, 5)
    });
  } catch (error) {
    console.error('Dashboard Controller Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating dashboard' });
  }
};

// Generate practice question targeting weak areas
const getPracticeQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId });
    const reports = await Report.find({ user: userId });

    let weakAreas = [];
    reports.forEach(r => {
      if (r.weaknesses) weakAreas.push(...r.weaknesses);
    });
    // Add resume gaps too
    const latestResume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
    if (latestResume && latestResume.analysis && latestResume.analysis.gaps) {
      weakAreas.push(...latestResume.analysis.gaps);
    }
    weakAreas = Array.from(new Set(weakAreas));

    if (weakAreas.length === 0) {
      weakAreas = ['Data Structures', 'System Design', 'Behavioral HR scenarios'];
    }

    const targetJob = profile ? profile.targetJob : 'Software Engineer';

    console.log(`🤖 Generating practice question for weak areas: ${weakAreas.slice(0, 3)}`);

    const questionObj = await generatePracticeQuestion(weakAreas, targetJob);

    res.json({
      success: true,
      practiceQuestion: {
        questionText: questionObj.questionText,
        category: questionObj.category
      }
    });
  } catch (error) {
    console.error('Generate Practice Question Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating practice question' });
  }
};

// Submit and grade practice answer
const submitPracticeAnswer = async (req, res) => {
  const { questionText, category, userAnswer } = req.body;

  if (!questionText || !category || !userAnswer) {
    return res.status(400).json({ success: false, message: 'Missing practice question submission values' });
  }

  try {
    console.log(`🤖 Evaluating practice answer for category: ${category}`);

    // Call LLM
    const evaluation = await evaluateAnswer(questionText, 'technical', userAnswer);

    // Save practice session to logs
    const practice = await Practice.create({
      user: req.user.id,
      questionText,
      category,
      userAnswer,
      evaluation: {
        score: Math.round(evaluation.score / 10), // scale down to /10 scale for quick practice
        feedback: evaluation.comments,
        modelAnswer: evaluation.correctAnswerSuggested
      }
    });

    res.status(201).json({
      success: true,
      practice
    });
  } catch (error) {
    console.error('Submit Practice Answer Error:', error);
    res.status(500).json({ success: false, message: 'Server error evaluating practice answer' });
  }
};

// Toggle checklist state of roadmap topics
const toggleRoadmapTopic = async (req, res) => {
  const { moduleId, topicId, completed } = req.body;

  if (!moduleId || !topicId) {
    return res.status(400).json({ success: false, message: 'Missing module or topic ID' });
  }

  try {
    const roadmap = await Roadmap.findOne({ user: req.user.id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    const moduleItem = roadmap.modules.id(moduleId);
    if (!moduleItem) {
      return res.status(404).json({ success: false, message: 'Roadmap module not found' });
    }

    const topicItem = moduleItem.topics.id(topicId);
    if (!topicItem) {
      return res.status(404).json({ success: false, message: 'Roadmap topic not found' });
    }

    topicItem.completed = completed !== undefined ? completed : !topicItem.completed;
    roadmap.updatedAt = Date.now();

    // Recalculate module status
    const totalTopics = moduleItem.topics.length;
    const completedTopics = moduleItem.topics.filter(t => t.completed).length;

    if (completedTopics === 0) {
      moduleItem.status = 'pending';
    } else if (completedTopics === totalTopics) {
      moduleItem.status = 'completed';
    } else {
      moduleItem.status = 'in-progress';
    }

    await roadmap.save();

    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Toggle Roadmap Topic Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating roadmap topic' });
  }
};

module.exports = {
  getDashboardData,
  getPracticeQuestion,
  submitPracticeAnswer,
  toggleRoadmapTopic
};
