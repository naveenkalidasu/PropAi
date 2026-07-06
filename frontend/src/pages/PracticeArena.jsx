import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import { 
  Award, 
  HelpCircle, 
  Send, 
  CheckCircle, 
  FileText, 
  ArrowRight,
  BookOpen,
  Settings,
  ShieldQuestion
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PracticeArena = () => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  
  const [history, setHistory] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Generating practice challenge...');

  const fetchPracticeQuestion = async () => {
    setLoading(true);
    setEvaluation(null);
    setUserAnswer('');
    setStatusMessage('Generating placement challenge targeted to your weak areas...');

    try {
      const res = await api.get('/dashboard/practice/generate');
      if (res.data.success) {
        setQuestion(res.data.practiceQuestion);
      }
    } catch (err) {
      console.error('Error fetching practice question:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setHistory(res.data.recentPractice || []);
      }
    } catch (err) {
      console.error('Error fetching practice history:', err);
    }
  };

  useEffect(() => {
    fetchPracticeQuestion();
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setEvaluating(true);

    try {
      const res = await api.post('/dashboard/practice/submit', {
        questionText: question.questionText,
        category: question.category,
        userAnswer: userAnswer
      });

      if (res.data.success) {
        setEvaluation(res.data.practice.evaluation);
        fetchHistory(); // sync history logs
      }
    } catch (err) {
      console.error('Error submitting practice answer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <div class="border-b border-gray-200 dark:border-darkbg-700 pb-4">
        <h1 class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          Placement Practice Arena <ShieldQuestion class="text-primary-500" size={24} />
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          Train on AI-targeted challenges formulated directly from your previous mock interview weak points.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Console: Active Challenge (col-span-2) */}
        <div class="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {loading && (
              <div class="p-8 rounded-3xl bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 min-h-[300px] flex items-center justify-center">
                <LoadingState message={statusMessage} />
              </div>
            )}

            {!loading && question && !evaluation && !evaluating && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4"
              >
                <div class="flex items-center justify-between border-b border-gray-100 dark:border-darkbg-700 pb-3">
                  <span class="px-2.5 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-500 font-bold text-[10px] uppercase rounded-lg">
                    {question.category}
                  </span>
                </div>

                <div class="space-y-1">
                  <label class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Practice Challenge</label>
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-relaxed bg-gray-50 dark:bg-darkbg-900/50 p-4 rounded-2xl border border-gray-100 dark:border-darkbg-700">
                    {question.questionText}
                  </p>
                </div>

                <form onSubmit={handleSubmit} class="space-y-4">
                  <div class="space-y-1">
                    <label class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Your Answer</label>
                    <textarea
                      required
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Write your explanation or code solution here..."
                      class="w-full h-40 px-4 py-3 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-gray-50 dark:bg-darkbg-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-sans"
                    />
                  </div>

                  <div class="flex gap-4">
                    <button
                      type="button"
                      onClick={fetchPracticeQuestion}
                      class="flex-1 py-3 rounded-xl border border-gray-200 dark:border-darkbg-700 font-bold text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-darkbg-900/50 transition-colors"
                    >
                      Skip Challenge
                    </button>
                    <button
                      type="submit"
                      disabled={!userAnswer.trim()}
                      class="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      Submit Response <Send size={14} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {evaluating && (
              <div class="p-8 rounded-3xl bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 shadow-sm text-center">
                <LoadingState message="AI engine is evaluating practice submission..." />
              </div>
            )}

            {!loading && evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4"
              >
                <div class="flex items-center justify-between border-b border-gray-100 dark:border-darkbg-700 pb-3">
                  <h3 class="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <CheckCircle class="text-green-500" size={18} /> Practice Graded
                  </h3>
                  <div class="text-right">
                    <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Score Rating</span>
                    <span class="text-lg font-extrabold text-primary-500 block">{evaluation.score}/10</span>
                  </div>
                </div>

                <div class="space-y-1">
                  <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText size={12} /> AI Feedback
                  </span>
                  <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-darkbg-900/50 p-4 rounded-xl italic">
                    "{evaluation.feedback}"
                  </p>
                </div>

                <div class="space-y-1">
                  <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen size={12} /> Ideal Reference Answer
                  </span>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-darkbg-900/50 p-4 rounded-xl">
                    {evaluation.modelAnswer}
                  </p>
                </div>

                <button
                  onClick={fetchPracticeQuestion}
                  class="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  Next Challenge <ArrowRight size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Console: Practice History (col-span-1) */}
        <div class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex flex-col justify-between gap-4 h-fit">
          <div>
            <h3 class="font-bold text-base text-gray-800 dark:text-gray-200">Practice History</h3>
            <p class="text-[10px] text-gray-400">Review your past practice drills</p>
          </div>

          <div class="space-y-3 max-h-96 overflow-y-auto pr-1">
            {history.map((log) => (
              <div 
                key={log._id}
                class="p-3 rounded-xl bg-gray-50 dark:bg-darkbg-900/50 border border-gray-100 dark:border-darkbg-700/50 flex flex-col gap-1 text-[11px]"
              >
                <div class="flex justify-between items-center font-bold text-gray-700 dark:text-gray-300">
                  <span class="truncate max-w-[120px]">{log.category}</span>
                  <span class="text-primary-500">{log.evaluation?.score}/10</span>
                </div>
                <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">Q: {log.questionText}</p>
                <span class="text-[9px] text-gray-400 self-end mt-1">{new Date(log.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            {history.length === 0 && (
              <p class="text-xs text-gray-400 italic text-center py-6">No practice history logs found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeArena;
