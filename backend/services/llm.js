const axios = require('axios');

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL_NAME = 'mistral-small-latest'; // High-quality Mistral model for structuring outputs

// Helper to sanitize and parse JSON response from LLM
const parseLLMJson = (text) => {
  try {
    // Strip markdown code block formatting if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON from LLM response. Raw response was:', text);
    // Fallback parsing / extraction if possible
    try {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const JSONString = text.substring(firstBrace, lastBrace + 1);
        return JSON.parse(JSONString);
      }
    } catch (nestedErr) {
      console.error('Fallback JSON parsing also failed:', nestedErr);
    }
    throw new Error('Invalid JSON structure returned from AI service');
  }
};

const makeLLMCall = async (messages, temperature = 0.2, maxTokens = 1500) => {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error('LLM_API_KEY is not defined in environment variables');
  }

  try {
    const response = await axios.post(
      MISTRAL_URL,
      {
        model: MODEL_NAME,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000 // 45 seconds timeout
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Mistral API:', error.response ? error.response.data : error.message);
    throw new Error('AI Service communication failed');
  }
};

/**
 * 1. Resume Analysis
 */
const analyzeResume = async (resumeText, targetJob) => {
  const prompt = `
  You are an expert ATS (Applicant Tracking System) algorithm and recruiter.
  Analyze the following resume text against the target job title: "${targetJob}".
  
  Provide:
  1. An ATS Score (0 to 100).
  2. List of core technical and soft skills identified in the resume.
  3. Gaps (critical skills, experiences, or tools required for "${targetJob}" that are missing or weak in the resume).
  4. Specific, actionable suggestions to improve the resume for this job role.

  You must respond ONLY with a JSON object inside valid JSON syntax. Do not write any conversational text or explanation. 
  JSON Schema structure:
  {
    "atsScore": 85,
    "skills": ["JavaScript", "React", "Node.js"],
    "gaps": ["TypeScript", "Docker", "Unit Testing"],
    "suggestions": [
      "Add a dedicated section for cloud hosting technologies like AWS/GCP.",
      "Detail your accomplishments with quantitative metrics in your previous React developer role."
    ]
  }

  Resume Text:
  ${resumeText}
  `;

  const messages = [
    { role: 'system', content: 'You are a professional technical recruiter and ATS analyzer. Output strictly valid JSON.' },
    { role: 'user', content: prompt }
  ];

  const responseText = await makeLLMCall(messages, 0.2, 1000);
  return parseLLMJson(responseText);
};

/**
 * 2. Personalized Learning Roadmap
 */
const generateLearningRoadmap = async (skills, gaps, targetJob) => {
  const prompt = `
  Based on the candidate's target job: "${targetJob}",
  their current skills: ${JSON.stringify(skills)},
  and identify skill gaps: ${JSON.stringify(gaps)},
  
  Create a personalized study roadmap consisting of sequential modules (approx. 4 weeks or 4 stages).
  For each module, provide:
  1. Title
  2. Description
  3. Duration (e.g. "Week 1", "Week 2")
  4. List of topics to learn. For each topic, supply 2-3 specific learning resources (online documentation names, tutorials, or search terms).
  
  You must respond ONLY with a JSON object. No other text.
  JSON Schema structure:
  {
    "skillsToLearn": ["TypeScript", "Docker"],
    "modules": [
      {
        "title": "Mastering TypeScript Foundations",
        "description": "Learn static typing, interfaces, custom types, and compilation setup.",
        "duration": "Week 1",
        "topics": [
          {
            "name": "Static Types and Interfaces",
            "resources": [
              "Official TypeScript Handbook: Interfaces",
              "TypeScript Deep Dive by Basarat"
            ]
          }
        ]
      }
    ]
  }
  `;

  const messages = [
    { role: 'system', content: 'You are an educational roadmap planner. Output strictly valid JSON.' },
    { role: 'user', content: prompt }
  ];

  const responseText = await makeLLMCall(messages, 0.3, 1500);
  return parseLLMJson(responseText);
};

/**
 * 3. Question Generation
 */
const generateQuestion = async (type, role, difficulty, previousHistory = []) => {
  let codingInstructions = '';
  if (type === 'coding') {
    codingInstructions = `
    Since this is a CODING round question, you must also generate:
    1. Suggested coding boilerplates (templates) for: javascript, python, java, cpp.
    2. At least 3 test cases. Each test case has an "input" (string), "output" (string), and "isPublic" (boolean, true for the first 2, false for the others).
    Keep coding problems suitable for online compilers (e.g., standard input/output or function completion).
    `;
  }

  const prompt = `
  Generate a single interview question for the following setup:
  - Role: ${role}
  - Type: ${type} (can be 'hr', 'technical', or 'coding')
  - Difficulty: ${difficulty} (easy, medium, hard)
  - Previous Questions Asked (avoid repeating these): ${JSON.stringify(previousHistory.map(h => h.questionText || h.text))}

  For 'hr': Ask behavioral or communication questions (e.g., situation-based questions).
  For 'technical': Ask conceptually deep questions regarding architectures, design patterns, coding theories, framework principles.
  For 'coding': Ask a problem solving/algorithmic question (e.g. string manipulation, arrays, trees, dynamic programming).

  Provide:
  1. The question text.
  2. Difficulty level.
  3. Suggested answer guidelines (ideal concepts the interviewer expects).
  ${codingInstructions}

  You must respond ONLY with a JSON object.
  JSON Schema structure:
  {
    "text": "Write a function that merges two sorted arrays...",
    "difficulty": "${difficulty}",
    "suggestedAnswer": "Understand merge intervals or two-pointer approach with O(N+M) time complexity.",
    "codingTemplate": {
      "javascript": "function mergeArrays(arr1, arr2) {\\n  // Write code here\\n}",
      "python": "def merge_arrays(arr1, arr2):\\n    # Write code here\\n    pass",
      "java": "public class Solution {\\n    public int[] mergeArrays(int[] arr1, int[] arr2) {\\n        // Write code here\\n        return new int[0];\\n    }\\n}",
      "cpp": "vector<int> mergeArrays(vector<int>& arr1, vector<int>& arr2) {\\n    // Write code here\\n}"
    },
    "testCases": [
      { "input": "[1,3], [2,4]", "output": "[1,2,3,4]", "isPublic": true },
      { "input": "[], [1]", "output": "[1]", "isPublic": true },
      { "input": "[5,7], [3,6]", "output": "[3,5,6,7]", "isPublic": false }
    ]
  }

  Note: If the type is 'hr' or 'technical', leave "codingTemplate" and "testCases" key out or set to null.
  `;

  const messages = [
    { role: 'system', content: 'You are an elite corporate technical interviewer. Output strictly valid JSON.' },
    { role: 'user', content: prompt }
  ];

  const responseText = await makeLLMCall(messages, 0.4, 1500);
  return parseLLMJson(responseText);
};

/**
 * 4. Answer Evaluation
 */
const evaluateAnswer = async (questionText, questionType, answerText, codeLanguage = '') => {
  const prompt = `
  You are an experienced technical interviewer. Evaluate the candidate's answer.
  
  Question:
  ${questionText}
  
  Question Type: ${questionType}
  ${codeLanguage ? `Coding Language used: ${codeLanguage}` : ''}

  Candidate's Answer/Code:
  ${answerText}

  Provide:
  1. A score from 0 to 100 based on accuracy, completeness, logic, and clarity.
  2. General comments/feedback.
  3. 2-3 specific strengths shown in the response.
  4. 2-3 specific weaknesses or bugs.
  5. The suggested ideal answer or correct code snippet.

  You must respond ONLY with a JSON object.
  JSON Schema structure:
  {
    "score": 75,
    "comments": "The candidate has a good grasp of database indexes, but missed details on compound index sorting.",
    "strengths": ["Clear explanation of B-Trees", "Good practical examples"],
    "weaknesses": ["Missed index sorting bounds", "Did not mention index write overhead"],
    "correctAnswerSuggested": "An ideal response would detail B-Tree nodes, indexing fields, and using EXPLAIN to audit queries..."
  }
  `;

  const messages = [
    { role: 'system', content: 'You are an assessment engine. Output strictly valid JSON.' },
    { role: 'user', content: prompt }
  ];

  const responseText = await makeLLMCall(messages, 0.2, 1000);
  return parseLLMJson(responseText);
};

/**
 * 5. Follow-up Question
 */
const generateFollowUpQuestion = async (questionText, answerText, history = []) => {
  const prompt = `
  You are conducting an interactive voice mock interview. The candidate just answered your question.
  Ask a logical, brief, and conversational follow-up question based on their answer.
  
  Original Question: ${questionText}
  Candidate's Answer: ${answerText}
  Interview Context: ${JSON.stringify(history)}

  Respond ONLY with the follow-up question text itself. Do not say "Here is the follow up" or use quotes. Keep it to 1-2 sentences.
  `;

  const messages = [
    { role: 'system', content: 'You are an active listening interviewer. Ask a short follow-up.' },
    { role: 'user', content: prompt }
  ];

  return await makeLLMCall(messages, 0.5, 150);
};

/**
 * 6. Final Performance Report
 */
const generateFinalReport = async (type, role, history) => {
  const prompt = `
  Generate a comprehensive placement preparation report based on this interview session.
  - Interview Type: ${type}
  - Role: ${role}
  - Full Question-and-Answer Logs:
  ${JSON.stringify(history, null, 2)}

  Provide:
  1. Overall numeric score (0 to 100).
  2. Aggregated Strengths (3-5 items).
  3. Aggregated Weaknesses/Gaps (3-5 items).
  4. Detailed, concrete action items/Improvement tips.
  5. Final Recommendation: HIRE, CONSIDER, or REJECT.
  6. Detailed Feedback written in beautiful markdown, including summary scores per question and structured advice.

  You must respond ONLY with a JSON object.
  JSON Schema structure:
  {
    "overallScore": 72,
    "strengths": ["Excellent communication", "Strong knowledge of system design"],
    "weaknesses": ["Weak dynamic programming logic", "Poor code structure efficiency"],
    "improvementTips": ["Practice sliding window coding challenges", "Revise garbage collection mechanics in JS"],
    "finalRecommendation": "CONSIDER",
    "detailedFeedback": "### Interview Feedback Summary\\n\\nOverall the candidate..."
  }
  `;

  const messages = [
    { role: 'system', content: 'You are a senior talent acquisition director. Output strictly valid JSON.' },
    { role: 'user', content: prompt }
  ];

  const responseText = await makeLLMCall(messages, 0.3, 2000);
  return parseLLMJson(responseText);
};

/**
 * 7. AI Practice Questions Generator
 */
const generatePracticeQuestion = async (weakAreas, role) => {
  const prompt = `
  Create a single study practice question targeted to improve the candidate's weak areas.
  - Target Role: ${role}
  - Weak areas to target: ${JSON.stringify(weakAreas)}

  Provide:
  1. A clear, challenging question.
  2. The category/topic of this question.
  3. A detailed model answer / guide.

  You must respond ONLY with a JSON object.
  JSON Schema structure:
  {
    "questionText": "Describe the difference between debounce and throttle, and write a simple implementation of debounce.",
    "category": "JavaScript Performance Optimization",
    "suggestedAnswer": "Debouncing schedules a function call after a delay since the last call, whereas throttling enforces a maximum rate of calls..."
  }
  `;

  const messages = [
    { role: 'system', content: 'You are an educational tutor generating learning assessments. Output strictly valid JSON.' },
    { role: 'user', content: prompt }
  ];

  const responseText = await makeLLMCall(messages, 0.4, 1000);
  return parseLLMJson(responseText);
};

module.exports = {
  analyzeResume,
  generateLearningRoadmap,
  generateQuestion,
  evaluateAnswer,
  generateFollowUpQuestion,
  generateFinalReport,
  generatePracticeQuestion
};
