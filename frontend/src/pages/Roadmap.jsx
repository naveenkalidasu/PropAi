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
      <div className="p-6 max-w-3xl mx-auto text-center space-y-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 space-y-4 shadow-sm flex flex-col items-center">
          <div className="p-4 bg-yellow-500/10 text-yellow-600 rounded-2xl">
            <FileWarning size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Study Path Not Generated</h2>
          <p className="text-xs text-gray-400 max-w-md leading-relaxed">
            Your personalized study roadmap is compiled based on your resume scan and identified skill gaps. Please scan your resume PDF first.
          </p>
          <Link
            to="/resume"
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
          >
            Scan Resume PDF
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 z-10 relative">
      {/* Header Panel */}
      <div className="p-6 rounded-3xl border border-gray-250/20 dark:border-darkbg-700/60 bg-white/70 dark:bg-darkbg-800/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-150 tracking-tight flex items-center gap-2">
              Personalized Study Path <Sparkles className="text-primary-500 animate-pulse" size={24} />
            </h1>
            <p className="text-xs text-gray-450 mt-1.5 leading-relaxed">
              Custom modules generated to fill skill gaps for <span className="font-bold underline text-primary-500">{roadmap.role}</span>.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Overall Progress</span>
            <h3 className="text-3xl font-black text-primary-500 mt-0.5 leading-none">{progress}%</h3>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-3 bg-gray-150/40 dark:bg-darkbg-700/60 rounded-full overflow-hidden border border-gray-200/5 dark:border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-accent-violet transition-all duration-750 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Vertical Roadmap Timeline */}
      <div className="relative pl-6 md:pl-8 border-l-2 border-gray-250/30 dark:border-darkbg-700/60 space-y-8 py-4">
        {roadmap.modules.map((mod, modIdx) => (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: modIdx * 0.1 }}
            key={mod._id}
            className="relative space-y-4"
          >
            {/* Timeline Marker Pin */}
            <span className={`absolute -left-[37px] md:-left-[45px] top-1.5 p-1 rounded-full border-2 transition-colors duration-300 shadow-sm
              ${mod.status === 'completed' 
                ? 'bg-green-500 border-green-200 dark:border-green-950 text-white shadow-green-500/10' 
                : (mod.status === 'in-progress' 
                  ? 'bg-primary-500 border-primary-200 dark:border-primary-950 text-white shadow-primary-500/10 animate-pulse' 
                  : 'bg-white dark:bg-darkbg-800 border-gray-300 dark:border-darkbg-700 text-gray-450')
              }
            `}>
              <MapPin size={16} />
            </span>

            {/* Stage Title / Week */}
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-[9px] font-extrabold text-primary-500 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={12} /> {mod.duration}
              </span>
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-150 tracking-tight">{mod.title}</h2>
            </div>

            {/* Module Card */}
            <div className="p-6 rounded-3xl border border-gray-250/20 dark:border-darkbg-700/60 bg-white/70 dark:bg-darkbg-800/80 shadow-sm space-y-5 glass-interactive">
              <p className="text-xs text-gray-600 dark:text-gray-350 leading-relaxed font-semibold">{mod.description}</p>
              
              <div className="border-t border-gray-150/20 dark:border-darkbg-700/50 pt-4 space-y-4">
                <h4 className="text-[9px] font-extrabold text-gray-400 dark:text-gray-550 uppercase tracking-widest pl-1">Topics Checklist</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mod.topics?.map((topic) => (
                    <div 
                      key={topic._id} 
                      className="p-4 rounded-2xl border border-gray-150/10 dark:border-darkbg-900/60 bg-gray-50/30 dark:bg-darkbg-900/30 flex items-start gap-3.5 hover:border-primary-500/20 transition-all duration-300 group"
                    >
                      <input
                        type="checkbox"
                        checked={topic.completed}
                        onChange={() => handleTopicCheck(mod._id, topic._id, topic.completed)}
                        className="h-5 w-5 rounded-lg border-gray-350 dark:border-darkbg-700/60 text-primary-500 focus:ring-primary-500/30 dark:focus:ring-primary-500/20 mt-0.5 cursor-pointer accent-primary-500 transition-all"
                      />
                      <div className="space-y-2.5 flex-1">
                        <span className={`text-xs font-bold leading-relaxed cursor-pointer select-none transition-all
                          ${topic.completed 
                            ? 'text-gray-400 dark:text-gray-550 line-through font-semibold' 
                            : 'text-gray-700 dark:text-gray-250 group-hover:text-primary-500'
                          }`}
                          onClick={() => handleTopicCheck(mod._id, topic._id, topic.completed)}
                        >
                          {topic.name}
                        </span>

                        {/* Resource links under topic */}
                        {topic.resources && topic.resources.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-gray-150/10 dark:border-darkbg-700/40">
                            <span className="text-[9px] font-extrabold text-gray-450 uppercase tracking-widest flex items-center gap-1">
                              <BookOpen size={10} className="text-primary-500" /> Resources
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {topic.resources.map((res, resIdx) => (
                                <a
                                  key={resIdx}
                                  href={`https://www.google.com/search?q=${encodeURIComponent(res)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-primary-500 hover:text-primary-600 px-2 py-0.5 rounded bg-primary-55/10 dark:bg-primary-500/5 hover:bg-primary-500/10 border border-primary-500/10 flex items-center gap-1 transition-all"
                                >
                                  {res} <ExternalLink size={8} />
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
