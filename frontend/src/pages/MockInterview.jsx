import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSpeech } from '../utils/useSpeech';
import AudioRecorder from '../components/AudioRecorder';
import LoadingState from '../components/LoadingState';
import { io } from 'socket.io-client';
import { 
  Volume2, 
  ArrowRight, 
  Tv, 
  Hourglass, 
  CheckCircle,
  FileText,
  AlertTriangle,
  Play,
  SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MockInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { interviewId, role, type, difficulty } = location.state || {};

  // Speech Helper Hook
  const { 
    speak, 
    cancelSpeech, 
    isListening, 
    transcript, 
    setTranscript, 
    startListening, 
    stopListening 
  } = useSpeech();

  // States
  const [question, setQuestion] = useState(null);
  const [qNumber, setQNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Generating question...');
  
  // Real-time evaluation states
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer Ref
  const timerRef = useRef(null);
  const socketRef = useRef(null);

  // Redirect if accessed directly without setup state
  useEffect(() => {
    if (!interviewId) {
      navigate('/interview');
    }
  }, [interviewId, navigate]);

  // Connect Socket.io for real-time telemetry (Visual effects)
  useEffect(() => {
    if (interviewId) {
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('join_interview', { interviewId });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [interviewId]);

  // Sync elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Fetch the first question on mount
  useEffect(() => {
    if (interviewId) {
      fetchQuestion();
    }
    return () => cancelSpeech();
  }, [interviewId]);

  const fetchQuestion = async () => {
    setLoading(true);
    setEvaluation(null);
    setTranscript('');
    setStatusMessage('AI Interviewer is formulating a question...');

    try {
      const res = await api.post('/interview/question', {
        interviewId,
        type,
        role,
        difficulty
      });

      if (res.data.success) {
        setQuestion(res.data.question);
        // Automatically speak the question
        speak(res.data.question.text);
      }
    } catch (err) {
      console.error('Fetch Question Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplayVoice = () => {
    if (question) speak(question.text);
  };

  const handleAnswerSubmit = async () => {
    if (!transcript.trim()) return;

    cancelSpeech();
    setEvaluating(true);

    try {
      // 1. Submit raw answer
      const submitRes = await api.post('/interview/answer', {
        interviewId,
        questionId: question._id,
        answerText: transcript
      });

      if (submitRes.data.success) {
        const { answerId } = submitRes.data;

        // Socket emission
        if (socketRef.current) {
          socketRef.current.emit('candidate_speech_status', { interviewId, text: transcript });
        }

        // 2. Perform AI Evaluation for this single answer
        const evalRes = await api.post('/interview/evaluate', { answerId });
        if (evalRes.data.success) {
          setEvaluation(evalRes.data.evaluation);
        }
      }
    } catch (err) {
      console.error('Answer Submit/Evaluate Error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setQNumber(prev => prev + 1);
    fetchQuestion();
  };

  const handleSkip = () => {
    setTranscript('[SKIPPED]');
    setQNumber(prev => prev + 1);
    fetchQuestion();
  };

  const handleEndInterview = async () => {
    cancelSpeech();
    setLoading(true);
    setStatusMessage('Compiling overall performance metrics and saving report...');

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

  // Helper to format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingState message={statusMessage} />;

  return (
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      {/* Session Header Card */}
      <div class="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-lg text-xs font-bold capitalize">
            {type} Round
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            Target: <span class="font-semibold text-gray-700 dark:text-gray-300">{role}</span>
          </span>
        </div>

        <div class="flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <span class="flex items-center gap-1">
            <Hourglass size={14} /> {formatTime(elapsedTime)}
          </span>
          <span>Question {qNumber}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: AI Interviewer Card */}
        <div class="lg:col-span-1 p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm text-center flex flex-col justify-between items-center gap-6 min-h-[300px]">
          <div>
            <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Interviewer</span>
            <h3 class="font-extrabold text-lg text-gray-800 dark:text-gray-200 mt-1">PrepAI Avatar</h3>
          </div>

          {/* Pulsing Visual Sphere representing Voice Agent */}
          <div class="relative w-36 h-36 flex items-center justify-center">
            <div class={`absolute inset-0 rounded-full bg-primary-500/10 border border-primary-500/20 
              ${isListening ? 'animate-ping' : ''}`}
            />
            <div class="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 text-white flex items-center justify-center shadow-lg">
              <Tv size={40} class="animate-pulse" />
            </div>
          </div>

          <button
            onClick={handleReplayVoice}
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-darkbg-700 dark:hover:bg-darkbg-600 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Volume2 size={16} /> Replay Voice
          </button>
        </div>

        {/* Right Side: Question Card and Answer Console */}
        <div class="lg:col-span-2 space-y-6">
          {/* Question Display Card */}
          <div class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm relative overflow-hidden">
            <h4 class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Question Prompt</h4>
            <p class="text-sm md:text-base font-semibold leading-relaxed text-gray-800 dark:text-gray-100">
              {question?.text}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!evaluation && !evaluating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                class="space-y-4"
              >
                {/* Audio Recording console */}
                <AudioRecorder
                  isListening={isListening}
                  onStart={() => startListening()}
                  onStop={() => stopListening()}
                  transcript={transcript}
                  onChange={setTranscript}
                />

                {/* Operations Buttons */}
                <div class="flex gap-4">
                  <button
                    onClick={handleSkip}
                    class="flex-1 py-3 rounded-xl border border-gray-200 dark:border-darkbg-700 font-bold text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-darkbg-900/50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <SkipForward size={14} /> Skip Question
                  </button>
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!transcript.trim()}
                    class="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    Submit Answer <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {evaluating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                class="p-8 rounded-3xl bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 shadow-sm text-center"
              >
                <LoadingState message="AI engine is assessing response correctness..." />
              </motion.div>
            )}

            {/* Micro Evaluation Report (Displayed immediately) */}
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4"
              >
                <div class="flex justify-between items-center border-b border-gray-100 dark:border-darkbg-700 pb-3">
                  <h3 class="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <CheckCircle class="text-green-500" size={18} /> Question Assessment
                  </h3>
                  <div class="text-right">
                    <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Score</span>
                    <span class="text-lg font-extrabold text-primary-500 block">{evaluation.score}/100</span>
                  </div>
                </div>

                <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                  "{evaluation.comments}"
                </p>

                {/* Strengths / Weaknesses Grid */}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div class="space-y-2">
                    <span class="text-[9px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle size={10} /> Strengths
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
                  <div class="space-y-2">
                    <span class="text-[9px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle size={10} /> Weaknesses
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
                    <FileText size={12} /> Suggested Ideal Answer
                  </span>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-darkbg-900/50 p-3 rounded-xl">
                    {evaluation.correctAnswerSuggested}
                  </p>
                </div>

                {/* Navigation actions */}
                <div class="flex gap-4 pt-2">
                  <button
                    onClick={handleEndInterview}
                    class="flex-1 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-bold text-xs text-center transition-colors"
                  >
                    Finish Interview
                  </button>
                  
                  {qNumber < 5 ? (
                    <button
                      onClick={handleNext}
                      class="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      Next Question <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleEndInterview}
                      class="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
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

export default MockInterview;
