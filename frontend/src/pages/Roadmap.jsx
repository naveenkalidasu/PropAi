import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import { 
  MapPin, 
  CheckCircle, 
  HelpCircle, 
  ExternalLink, 
  BookOpen, 
  FileWarning, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const fetchRoadmap = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setRoadmap(res.data.roadmap);
        calculateProgress(res.data.roadmap);
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const calculateProgress = (mapData) => {
    if (!mapData || !mapData.modules) return;
    let total = 0;
    let completed = 0;
    mapData.modules.forEach(mod => {
      if (mod.topics) {
        total += mod.topics.length;
        completed += mod.topics.filter(t => t.completed).length;
      }
    });
    setProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
  };

  const handleTopicCheck = async (moduleId, topicId, currentVal) => {
    try {
      const res = await api.put('/dashboard/roadmap/topic', {
        moduleId,
        topicId,
        completed: !currentVal
      });

      if (res.data.success) {
        setRoadmap(res.data.roadmap);
        calculateProgress(res.data.roadmap);
      }
    } catch (err) {
      console.error('Error updating topic state:', err);
    }
  };

  if (loading) return <LoadingState message="Loading study roadmap milestones..." />;

  if (!roadmap || !roadmap.modules || roadmap.modules.length === 0) {
    return (
      <div class="p-6 max-w-3xl mx-auto text-center space-y-6">
        <div class="p-6 rounded-3xl bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 space-y-4 shadow-sm flex flex-col items-center">
          <div class="p-4 bg-yellow-500/10 text-yellow-600 rounded-2xl">
            <FileWarning size={32} />
          </div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Study Path Not Generated</h2>
          <p class="text-xs text-gray-400 max-w-md leading-relaxed">
            Your personalized study roadmap is compiled based on your resume scan and identified skill gaps. Please scan your resume PDF first.
          </p>
          <Link
            to="/resume"
            class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
          >
            Scan Resume PDF
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Panel */}
      <div class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Personalized Study Path <Sparkles class="text-primary-500 animate-pulse" size={24} />
            </h1>
            <p class="text-sm text-gray-400 mt-1">
              Custom modules generated to fill skill gaps for <span class="font-bold underline text-primary-500">{roadmap.role}</span>.
            </p>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Overall Progress</span>
            <h3 class="text-3xl font-extrabold text-primary-500 mt-0.5">{progress}%</h3>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div class="w-full h-3 bg-gray-100 dark:bg-darkbg-700 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Vertical Roadmap Timeline */}
      <div class="relative pl-6 md:pl-8 border-l-2 border-gray-200 dark:border-darkbg-700 space-y-8 py-2">
        {roadmap.modules.map((mod, modIdx) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: modIdx * 0.1 }}
            key={mod._id}
            class="relative space-y-4"
          >
            {/* Timeline Marker Pin */}
            <span class={`absolute -left-[37px] md:-left-[45px] top-1.5 p-1 rounded-full border-2 
              ${mod.status === 'completed' 
                ? 'bg-green-500 border-green-200 dark:border-green-950 text-white' 
                : (mod.status === 'in-progress' 
                  ? 'bg-primary-500 border-primary-200 dark:border-primary-950 text-white' 
                  : 'bg-white dark:bg-darkbg-800 border-gray-300 dark:border-darkbg-700 text-gray-400')
              }
            `}>
              <MapPin size={16} />
            </span>

            {/* Stage Title / Week */}
            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-[10px] font-extrabold text-primary-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} /> {mod.duration}
              </span>
              <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">{mod.title}</h2>
            </div>

            {/* Module Card */}
            <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
              <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{mod.description}</p>
              
              <div class="border-t border-gray-100 dark:border-darkbg-700 pt-4 space-y-4">
                <h4 class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Topics Checklist</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mod.topics?.map((topic) => (
                    <div 
                      key={topic._id} 
                      class="p-4 rounded-xl border border-gray-50 dark:border-darkbg-900 bg-gray-50/50 dark:bg-darkbg-900/30 flex items-start gap-3 hover:border-primary-500/30 transition-all group"
                    >
                      <input
                        type="checkbox"
                        checked={topic.completed}
                        onChange={() => handleTopicCheck(mod._id, topic._id, topic.completed)}
                        class="h-4.5 w-4.5 rounded border-gray-300 dark:border-darkbg-700 text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-500/50 mt-0.5 cursor-pointer accent-primary-500"
                      />
                      <div class="space-y-2 flex-1">
                        <span class={`text-xs font-semibold leading-none cursor-pointer select-none transition-all
                          ${topic.completed 
                            ? 'text-gray-400 dark:text-gray-500 line-through' 
                            : 'text-gray-700 dark:text-gray-300 group-hover:text-primary-500'
                          }`}
                          onClick={() => handleTopicCheck(mod._id, topic._id, topic.completed)}
                        >
                          {topic.name}
                        </span>

                        {/* Resource links under topic */}
                        {topic.resources && topic.resources.length > 0 && (
                          <div class="space-y-1.5 pt-1.5 border-t border-gray-100 dark:border-darkbg-700/50">
                            <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                              <BookOpen size={10} /> Resources
                            </span>
                            <div class="space-y-1">
                              {topic.resources.map((res, resIdx) => (
                                <a
                                  key={resIdx}
                                  href={`https://www.google.com/search?q=${encodeURIComponent(res)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="text-[10px] font-medium text-primary-500 hover:underline flex items-center gap-1 w-fit"
                                >
                                  {res} <ExternalLink size={10} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;
