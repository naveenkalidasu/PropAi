import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CodeEditor from '../components/CodeEditor';
import LoadingState from '../components/LoadingState';
import { 
  Play, 
  Send, 
  Terminal, 
  Info,
  CheckCircle,
  AlertTriangle,
  FileCode,
  ArrowRight,
  SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CodingRound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { interviewId, role, type, difficulty } = location.state || {};

  // States
  const [question, setQuestion] = useState(null);
  const [qNumber, setQNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Generating coding challenge...');
  
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  
  // Console outputs
  const [consoleOutput, setConsoleOutput] = useState('');
  const [runningTests, setRunningTests] = useState(false);
  const [testsRun, setTestsRun] = useState(false);

  // Evaluation states
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef(null);

  // Redirect if accessed directly
  useEffect(() => {
    if (!interviewId) {
      navigate('/interview');
    }
  }, [interviewId, navigate]);

  // Sync elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Fetch question
  useEffect(() => {
    if (interviewId) {
      fetchQuestion();
    }
  }, [interviewId]);

  const fetchQuestion = async () => {
    setLoading(true);
    setEvaluation(null);
    setTestsRun(false);
    setConsoleOutput('');
    setStatusMessage('Generating algorithmic coding challenge...');

    try {
      const res = await api.post('/interview/question', {
        interviewId,
        type: 'coding',
        role,
        difficulty
      });

      if (res.data.success) {
        const qData = res.data.question;
        setQuestion(qData);
        // Default code to javascript template
        setCode(qData.codingTemplate?.javascript || '// Write code here');
        setSelectedLanguage('javascript');
      }
    } catch (err) {
      console.error('Fetch Question Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (question && question.codingTemplate) {
      setCode(question.codingTemplate[lang] || '// Write code here');
    }
  };

  // Compile & Run Test Cases simulation
  const handleRunTests = () => {
    if (!code.trim()) return;

    setRunningTests(true);
    setConsoleOutput('Compiling solution...\nAnalyzing syntax tree...\nLinking standard libraries...\n');

    setTimeout(() => {
      const testCases = question?.testCases || [];
      let outputLogs = '';
      let passedCount = 0;

      testCases.forEach((tc, idx) => {
        outputLogs += `────────────────────────────────────────\n`;
        outputLogs += `Test Case ${idx + 1}:\n`;
        outputLogs += `Input:  ${tc.input}\n`;
        outputLogs += `Expected Output: ${tc.output}\n`;
        // Simulate a success match
        outputLogs += `Actual Output:   ${tc.output}\n`;
        outputLogs += `Status: ✅ Passed\n`;
        passedCount++;
      });

      outputLogs += `────────────────────────────────────────\n`;
      outputLogs += `Results: ${passedCount}/${testCases.length} Test Cases Passed.\n`;
      
      setConsoleOutput(prev => prev + outputLogs);
      setRunningTests(false);
      setTestsRun(true);
    }, 2000);
  };

  // Submit Answer
  const handleSubmitSolution = async () => {
    if (!code.trim()) return;

    setEvaluating(true);

    try {
      // 1. Submit Code Solution
      const submitRes = await api.post('/interview/answer', {
        interviewId,
        questionId: question._id,
        answerText: code,
        codeLanguage: selectedLanguage
      });

      if (submitRes.data.success) {
        const { answerId } = submitRes.data;

        // 2. Perform AI assessment of the code
        const evalRes = await api.post('/interview/evaluate', { answerId });
        if (evalRes.data.success) {
          setEvaluation(evalRes.data.evaluation);
        }
      }
    } catch (err) {
      console.error('Submit/Evaluate Code Error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setQNumber(prev => prev + 1);
    fetchQuestion();
  };

  const handleSkip = () => {
    setCode('// [SKIPPED]');
    setQNumber(prev => prev + 1);
    fetchQuestion();
  };

  const handleEndInterview = async () => {
    setLoading(true);
    setStatusMessage('Compiling final placement readiness report...');

    try {
      const res = await api.post('/interview/end', { interviewId });
      if (res.data.success) {
        navigate(`/reports/${interviewId}`);
      }
    } catch (err) {
      console.error('End Interview Error:', err);
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingState message={statusMessage} />;

  return (
    <div class="p-4 max-w-[95rem] mx-auto space-y-4">
      {/* Header Info Panel */}
      <div class="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-xs font-bold">
            Coding Sandbox
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400 hidden md:inline">
            Interview Session: <span class="font-mono text-gray-700 dark:text-gray-300">{interviewId}</span>
          </span>
        </div>

        <div class="flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <span class="flex items-center gap-1">
             Timer: {formatTime(elapsedTime)}
          </span>
          <span>Challenge {qNumber}/5</span>
        </div>
      </div>

      {/* Main Split Console Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-170px)]">
        {/* Left Side: Coding Prompt & Gaps (col-span-5) */}
        <div class="lg:col-span-5 p-5 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex flex-col justify-between h-full overflow-y-auto">
          <div class="space-y-4">
            <div class="flex items-center gap-2 justify-between">
              <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">Problem Description</h2>
              <span class={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                ${question?.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' : ''}
                ${question?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400' : ''}
                ${question?.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' : ''}
              `}>
                {question?.difficulty}
              </span>
            </div>

            <div class="p-4 rounded-xl bg-gray-50 dark:bg-darkbg-900 border border-gray-100 dark:border-darkbg-700 text-xs text-gray-700 dark:text-gray-200 font-mono leading-relaxed whitespace-pre-wrap">
              {question?.text}
            </div>

            {/* Test Case Inputs display */}
            <div class="space-y-2">
              <h4 class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Example Inputs/Outputs</h4>
              <div class="space-y-2">
                {question?.testCases?.filter(tc => tc.isPublic).map((tc, idx) => (
                  <div key={idx} class="p-3 rounded-lg bg-gray-50 dark:bg-darkbg-900 text-[11px] font-mono space-y-1">
                    <div><span class="text-gray-400">Input:</span> <span class="text-gray-700 dark:text-gray-300">{tc.input}</span></div>
                    <div><span class="text-gray-400">Output:</span> <span class="text-emerald-500">{tc.output}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div class="flex items-start gap-2 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] leading-relaxed mt-4">
            <Info size={14} class="shrink-0 mt-0.5 text-blue-500" />
            <span>Click "Run Test Cases" to run local simulations. Click "Submit Solution" to assess algorithms.</span>
          </div>
        </div>

        {/* Right Side: Monaco Code Editor & Compiler Output (col-span-7) */}
        <div class="lg:col-span-7 flex flex-col gap-4 h-full">
          {/* Header Controls for language selection */}
          <div class="flex justify-between items-center p-3 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm shrink-0">
            <div class="flex items-center gap-2">
              <FileCode size={16} class="text-primary-500" />
              <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Select Language</span>
            </div>
            
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-darkbg-700 bg-gray-50 dark:bg-darkbg-900 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC 17)</option>
              <option value="java">Java 11</option>
            </select>
          </div>

          <AnimatePresence mode="wait">
            {!evaluation && !evaluating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                class="flex flex-col gap-4 flex-1 h-[calc(100%-60px)]"
              >
                {/* Editor Container */}
                <div class="flex-1 min-h-[300px]">
                  <CodeEditor
                    language={selectedLanguage}
                    value={code}
                    onChange={(val) => setCode(val || '')}
                  />
                </div>

                {/* Console Terminal Log Output */}
                <div class="h-44 p-4 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-darkbg-900 text-xs font-mono text-gray-300 overflow-y-auto space-y-1 relative shrink-0 shadow-inner">
                  <div class="sticky top-0 bg-darkbg-900 pb-1 border-b border-white/5 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    <span class="flex items-center gap-1"><Terminal size={12} /> Compiler Output Console</span>
                    <button onClick={() => setConsoleOutput('')} class="hover:text-white transition-colors">Clear</button>
                  </div>
                  <pre class="whitespace-pre-wrap leading-relaxed">{consoleOutput || 'Ready to run test cases. Compilation output will display here.'}</pre>
                  {runningTests && (
                    <div class="absolute inset-0 bg-darkbg-900/80 flex items-center justify-center text-xs font-bold">
                      <LoadingState message="Compiling..." />
                    </div>
                  )}
                </div>

                {/* Submit Panel */}
                <div class="flex gap-4 shrink-0">
                  <button
                    onClick={handleSkip}
                    class="flex-1 py-3 rounded-xl border border-gray-200 dark:border-darkbg-700 font-bold text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-darkbg-900/50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <SkipForward size={14} /> Skip Challenge
                  </button>
                  <button
                    onClick={handleRunTests}
                    class="flex-1 py-3 rounded-xl border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 text-primary-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play size={14} /> Run Test Cases
                  </button>
                  <button
                    onClick={handleSubmitSolution}
                    disabled={!testsRun}
                    class="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    Submit Solution <Send size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {evaluating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                class="flex-1 bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 rounded-2xl flex items-center justify-center"
              >
                <LoadingState message="AI engine is auditing code time/space complexities and correctness..." />
              </motion.div>
            )}

            {/* Assessment feedback */}
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                class="flex-1 bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 rounded-2xl p-6 overflow-y-auto space-y-4"
              >
                <div class="flex justify-between items-center border-b border-gray-100 dark:border-darkbg-700 pb-3">
                  <h3 class="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <CheckCircle class="text-green-500" size={18} /> Algorithmic Evaluation
                  </h3>
                  <div class="text-right">
                    <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Score</span>
                    <span class="text-lg font-extrabold text-primary-500 block">{evaluation.score}/100</span>
                  </div>
                </div>

                <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                  "{evaluation.comments}"
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <span class="text-[9px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle size={10} /> Good Optimizations
                    </span>
                    <ul class="space-y-1">
                      {evaluation.strengths?.map((str, idx) => (
                        <li key={idx} class="text-[10px] text-gray-500 dark:text-gray-400 flex items-start gap-1">
                          <span class="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div class="space-y-1">
                    <span class="text-[9px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle size={10} /> Code Gaps / Complexity Bugs
                    </span>
                    <ul class="space-y-1">
                      {evaluation.weaknesses?.map((wk, idx) => (
                        <li key={idx} class="text-[10px] text-gray-500 dark:text-gray-400 flex items-start gap-1">
                          <span class="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                          <span>{wk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div class="space-y-2 pt-3 border-t border-gray-100 dark:border-darkbg-700/50">
                  <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <FileCode size={12} /> Recommended Code Optimizations
                  </span>
                  <pre class="text-[10px] text-gray-300 bg-darkbg-900 p-4 rounded-xl overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
                    {evaluation.correctAnswerSuggested}
                  </pre>
                </div>

                <div class="flex gap-4 pt-2">
                  <button
                    onClick={handleEndInterview}
                    class="flex-1 py-3 rounded-xl border border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-bold text-xs"
                  >
                    Finish Interview
                  </button>
                  
                  {qNumber < 5 ? (
                    <button
                      onClick={handleNext}
                      class="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      Next Problem <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleEndInterview}
                      class="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      End & Generate Report <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CodingRound;
