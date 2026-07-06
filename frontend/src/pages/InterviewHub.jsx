import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  UserSquare2, 
  Terminal, 
  Binary, 
  ArrowRight, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

const InterviewHub = () => {
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async (type) => {
    setLoading(true);
    try {
      const res = await api.post('/interview/start', { type, difficulty });
      if (res.data.success) {
        const { interviewId, role } = res.data;
        if (type === 'coding') {
          navigate('/interview/coding', { state: { interviewId, role, type, difficulty } });
        } else {
          navigate('/interview/mock', { state: { interviewId, role, type, difficulty } });
        }
      }
    } catch (err) {
      console.error('Error starting interview session:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      id: 'hr',
      title: 'HR Behavioral Round',
      description: 'Test communication skills, situational scenarios, and alignment with company core values.',
      icon: <UserSquare2 size={32} />,
      color: 'from-blue-500 to-indigo-500',
      badge: 'Behavioral'
    },
    {
      id: 'technical',
      title: 'Technical Round',
      description: 'Deep dive into computer science fundamentals, target frameworks, databases, and systems architecture.',
      icon: <Terminal size={32} />,
      color: 'from-purple-500 to-pink-500',
      badge: 'CS Concepts'
    },
    {
      id: 'coding',
      title: 'Coding Challenge',
      description: 'Interactive coding console with test-case compilers. Solves data structures and algorithms challenges.',
      icon: <Binary size={32} />,
      color: 'from-emerald-500 to-teal-500',
      badge: 'DSA Sandbox'
    }
  ];

  return (
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div class="border-b border-gray-200 dark:border-darkbg-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            AI Interview Sandbox <Sparkles class="text-primary-500" size={24} />
          </h1>
          <p class="text-sm text-gray-400 mt-1">Select an interview round type and difficulty to test your placement readiness</p>
        </div>

        {/* Difficulty Select */}
        <div class="flex items-center gap-3 bg-white dark:bg-darkbg-800 p-1.5 rounded-xl border border-gray-200 dark:border-darkbg-700 w-fit">
          {['easy', 'medium', 'hard'].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              class={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all
                ${difficulty === d 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkbg-700/50'
                }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {categories.map((cat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            key={cat.id}
            class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-shadow group relative overflow-hidden"
          >
            {/* Top Badge overlay */}
            <span class="absolute top-4 right-4 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-darkbg-700 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {cat.badge}
            </span>

            <div class="space-y-4">
              {/* Icon Container with color gradient */}
              <div class={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-md`}>
                {cat.icon}
              </div>

              <div class="space-y-2">
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary-500 transition-colors">
                  {cat.title}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleStart(cat.id)}
              disabled={loading}
              class={`w-full py-3 rounded-xl bg-gradient-to-r ${cat.color} text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:scale-[1.02] disabled:opacity-50`}
            >
              Start Session
              <ArrowRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Helpful Hint banner */}
      <div class="flex items-start gap-3 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
        <Info size={20} class="shrink-0 mt-0.5 text-blue-500" />
        <div class="space-y-1">
          <h4 class="font-bold text-xs">Interviews are powered by real-time voice synthesis!</h4>
          <p class="text-[11px] opacity-90 leading-relaxed">
            Ensure your microphone is enabled. The AI interviewer will speak the questions out loud, and convert your spoken answers to text. You can also manually review or type edits before submitting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewHub;
