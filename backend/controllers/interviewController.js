const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Report = require('../models/Report');
const Profile = require('../models/Profile');
const { generateQuestion, evaluateAnswer, generateFinalReport, generateFollowUpQuestion } = require('../services/llm');

// Helper to generate unique Interview Session ID
const generateSessionId = () => {
  return 'int_' + Date.now() + '_' + Math.round(Math.random() * 1e9);
};

// Start a new interview session
const startInterview = async (req, res) => {
  const { type, difficulty } = req.body; // type: hr, technical, coding

  if (!type) {
    return res.status(400).json({ success: false, message: 'Please specify interview type' });
  }

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const targetJob = profile ? profile.targetJob : 'Software Engineer';
    const interviewId = generateSessionId();

    res.status(200).json({
      success: true,
      interviewId,
      role: targetJob,
      type,
      difficulty: difficulty || 'medium'
    });
  } catch (error) {
    console.error('Start Interview Error:', error);
    res.status(500).json({ success: false, message: 'Server error starting interview' });
  }
};

// Generate and retrieve the next question
const getNextQuestion = async (req, res) => {
  const { interviewId, type, role, difficulty } = req.body;

  if (!interviewId || !type || !role) {
    return res.status(400).json({ success: false, message: 'Missing interview context parameters' });
  }

  try {
    // Find all answers already submitted in this session
    const pastAnswers = await Answer.find({ user: req.user.id, interviewId });

    console.log(`🤖 Generating ${difficulty} ${type} question for ${role}. Past questions count: ${pastAnswers.length}`);

    // Call LLM
    const questionObj = await generateQuestion(type, role, difficulty || 'medium', pastAnswers);

    // Save generated question to DB
    const question = await Question.create({
      text: questionObj.text,
      type: type,
      role: role,
      difficulty: difficulty || 'medium',
      suggestedAnswer: questionObj.suggestedAnswer || '',
      codingTemplate: questionObj.codingTemplate || null,
      testCases: questionObj.testCases || []
    });

    // Strip sensitive fields (suggested answer & private test cases) before sending to client
    const clientQuestion = {
      _id: question._id,
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
      codingTemplate: question.codingTemplate,
      // Send only public test cases to candidate
      testCases: (question.testCases || [])
        .filter(tc => tc.isPublic === true)
        .map(tc => ({ input: tc.input, output: tc.output }))
    };

    res.status(200).json({
      success: true,
      question: clientQuestion
    });
  } catch (error) {
    console.error('Get Next Question Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating question' });
  }
};

// Submit answer for a question
const submitAnswer = async (req, res) => {
  const { interviewId, questionId, answerText, codeLanguage } = req.body;

  if (!interviewId || !questionId || !answerText) {
    return res.status(400).json({ success: false, message: 'Missing answer submission parameters' });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const answer = await Answer.create({
      user: req.user.id,
      interviewId,
      question: questionId,
      questionText: question.text,
      questionType: question.type,
      answerText,
      codeLanguage: codeLanguage || ''
    });

    res.status(201).json({
      success: true,
      message: 'Answer recorded successfully',
      answerId: answer._id
    });
  } catch (error) {
    console.error('Submit Answer Error:', error);
    res.status(500).json({ success: false, message: 'Server error recording answer' });
  }
};

// Evaluate an answer in real-time
const evaluateSingleAnswer = async (req, res) => {
  const { answerId } = req.body;

  if (!answerId) {
    return res.status(400).json({ success: false, message: 'Missing answerId for evaluation' });
  }

  try {
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    if (answer.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized review' });
    }

    console.log(`🤖 Evaluating answer for question: "${answer.questionText.substring(0, 40)}..."`);

    // Call LLM Evaluation
    const evaluation = await evaluateAnswer(
      answer.questionText,
      answer.questionType,
      answer.answerText,
      answer.codeLanguage
    );

    // Save evaluation to document
    answer.evaluation = {
      score: evaluation.score || 0,
      comments: evaluation.comments || '',
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      correctAnswerSuggested: evaluation.correctAnswerSuggested || ''
    };
    await answer.save();

    res.status(200).json({
      success: true,
      evaluation: answer.evaluation
    });
  } catch (error) {
    console.error('Evaluate Answer Error:', error);
    res.status(500).json({ success: false, message: 'Server error evaluating answer' });
  }
};

// End interview session & compile report
const endInterview = async (req, res) => {
  const { interviewId } = req.body;

  if (!interviewId) {
    return res.status(400).json({ success: false, message: 'Missing interviewId' });
  }

  try {
    // Gather all answers
    const answers = await Answer.find({ user: req.user.id, interviewId });
    if (answers.length === 0) {
      return res.status(400).json({ success: false, message: 'No answers recorded in this session' });
    }

    // Read details
    const firstAnswerObj = answers[0];
    const interviewType = firstAnswerObj.questionType; // hr / technical / coding
    
    const profile = await Profile.findOne({ user: req.user.id });
    const role = profile ? profile.targetJob : 'Software Engineer';

    console.log(`🤖 Ending interview ${interviewId}. Generating final report...`);

    // Prepare Q&A history logs for LLM report
    const historyLogs = answers.map(ans => ({
      questionText: ans.questionText,
      answerText: ans.answerText,
      evaluationScore: ans.evaluation ? ans.evaluation.score : 0,
      comments: ans.evaluation ? ans.evaluation.comments : ''
    }));

    // Call LLM Report Compiler
    const reportData = await generateFinalReport(interviewType, role, historyLogs);

    // Check if report already exists for this session
    let report = await Report.findOne({ interviewId });
    if (report) {
      report.overallScore = reportData.overallScore || 0;
      report.strengths = reportData.strengths || [];
      report.weaknesses = reportData.weaknesses || [];
      report.improvementTips = reportData.improvementTips || [];
      report.finalRecommendation = reportData.finalRecommendation || 'CONSIDER';
      report.detailedFeedback = reportData.detailedFeedback || '';
      await report.save();
    } else {
      report = await Report.create({
        user: req.user.id,
        interviewId,
        type: interviewType === 'coding' ? 'coding' : (interviewType === 'hr' ? 'hr' : 'technical'),
        role,
        overallScore: reportData.overallScore || 0,
        answers: answers.map(a => a._id),
        strengths: reportData.strengths || [],
        weaknesses: reportData.weaknesses || [],
        improvementTips: reportData.improvementTips || [],
        finalRecommendation: reportData.finalRecommendation || 'CONSIDER',
        detailedFeedback: reportData.detailedFeedback || ''
      });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('End Interview Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error compiling interview report' });
  }
};

// Fetch an individual report by interviewId
const getIndividualReport = async (req, res) => {
  const { interviewId } = req.params;

  try {
    const report = await Report.findOne({ interviewId }).populate('answers');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Interview report not found' });
    }

    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to report' });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get Individual Report Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving report' });
  }
};

module.exports = {
  startInterview,
  getNextQuestion,
  submitAnswer,
  evaluateSingleAnswer,
  endInterview,
  getIndividualReport
};
