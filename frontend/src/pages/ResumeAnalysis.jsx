import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { 
  FileUp, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Map, 
  TrendingUp, 
  Award,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ResumeAnalysis = () => {
  const { profile, fetchProfile } = useAuth();
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, analyzing, done, error
  const [statusMessage, setStatusMessage] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [error, setError] = useState('');

  // Fetch initial scan if already present in dashboard stats
  useEffect(() => {
    const fetchLatestScan = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success && res.data.latestResume) {
          setResumeData(res.data.latestResume);
          setRoadmapData(res.data.roadmap);
          setUploadState('done');
        }
      } catch (err) {
        console.error('Error fetching latest resume scan:', err);
      }
    };
    fetchLatestScan();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setError('Please upload a valid PDF document only.');
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setError('');
    setUploadState('uploading');
    setStatusMessage('Uploading your PDF resume to secure storage...');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      // 1. Upload & parse PDF
      const uploadRes = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const resumeId = uploadRes.data.resume.id;
        
        // 2. Perform AI ATS & Gap analysis
        setUploadState('analyzing');
        setStatusMessage('AI engine is analyzing ATS keyword match, identifying skill gaps, and generating roadmaps...');
        
        const analyzeRes = await api.post('/resume/analyze', { resumeId });
        
        if (analyzeRes.data.success) {
          setResumeData(analyzeRes.data.resume);
          setRoadmapData(analyzeRes.data.roadmap);
          setUploadState('done');
          fetchProfile(); // sync updated skills in profile
        }
      }
    } catch (err) {
      console.error('Upload & Analyze Error:', err);
      setError(err.response?.data?.message || 'Failed to complete resume scanning. Ensure PDF is text-extractable.');
      setUploadState('error');
    }
  };

  const resetScanner = () => {
    setFile(null);
    setUploadState('idle');
    setError('');
  };

  return (
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div class="border-b border-gray-200 dark:border-darkbg-700 pb-4">
        <h1 class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          Resume ATS Scanner
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          Scan your CV against target job role: <span class="font-bold underline text-primary-500">{profile?.targetJob || 'Software Engineer'}</span>.
        </p>
      </div>

      {uploadState === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          class="p-10 border-2 border-dashed border-gray-300 dark:border-darkbg-600 rounded-3xl bg-white dark:bg-darkbg-800 text-center space-y-6 flex flex-col items-center justify-center min-h-[350px] shadow-sm"
        >
          <div class="p-5 rounded-full bg-primary-500/10 text-primary-500 animate-bounce">
            <FileUp size={44} />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">Drag & Drop Resume PDF</h3>
            <p class="text-xs text-gray-400 mt-1">Support PDF documents up to 10MB</p>
          </div>

          <label class="px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-md">
            Browse Files
            <input type="file" accept=".pdf" onChange={handleFileChange} class="hidden" />
          </label>

          {file && (
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-darkbg-900 border border-gray-100 dark:border-darkbg-700">
              <span class="text-xs font-mono text-gray-600 dark:text-gray-300 truncate max-w-xs">{file.name}</span>
              <button onClick={() => setFile(null)} class="text-red-500 hover:text-red-600 font-bold text-xs pl-2">Remove</button>
            </div>
          )}

          {error && (
            <p class="text-xs font-semibold text-red-500 mt-2">{error}</p>
          )}

          {file && (
            <button
              onClick={handleUpload}
              class="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white font-bold text-sm shadow-lg transition-all"
            >
              Analyze Resume
            </button>
          )}
        </motion.div>
      )}

      {(uploadState === 'uploading' || uploadState === 'analyzing') && (
        <div class="p-10 rounded-3xl bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 min-h-[350px] flex items-center justify-center">
          <LoadingState message={statusMessage} />
        </div>
      )}

      {uploadState === 'error' && (
        <div class="p-10 rounded-3xl bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 text-center space-y-4 min-h-[350px] flex flex-col items-center justify-center">
          <p class="text-red-500 font-bold">Scanning Failed</p>
          <p class="text-xs text-gray-400 max-w-md">{error}</p>
          <button
            onClick={resetScanner}
            class="px-5 py-2.5 bg-primary-500 text-white font-bold rounded-xl text-xs shadow-md"
          >
            Try Again
          </button>
        </div>
      )}

      {uploadState === 'done' && resumeData && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          class="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* ATS Match Gauge */}
          <div class="lg:col-span-1 p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex flex-col items-center justify-between text-center gap-6">
            <h3 class="font-bold text-base text-gray-800 dark:text-gray-200">ATS Match Rating</h3>
            
            {/* Circular Gauge */}
            <div class="relative w-40 h-40 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  class="stroke-current text-gray-100 dark:text-darkbg-700"
                  stroke-width="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  class="stroke-current text-primary-500"
                  stroke-width="12"
                  stroke-dasharray={440}
                  stroke-dashoffset={440 - (440 * (resumeData.atsScore || 0)) / 100}
                  stroke-linecap="round"
                  fill="transparent"
                />
              </svg>
              <div class="absolute flex flex-col items-center justify-center">
                <span class="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{resumeData.atsScore || 0}%</span>
                <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Match Score</span>
              </div>
            </div>

            <div class="space-y-2 w-full">
              <div class="flex items-center gap-2 justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                <TrendingUp size={16} class="text-primary-500" />
                <span>Target: {profile?.targetJob || 'Software Engineer'}</span>
              </div>
              <p class="text-[11px] text-gray-400">Scan was saved on {new Date(resumeData.createdAt).toLocaleDateString()}</p>
            </div>

            <div class="flex gap-3 w-full">
              <button
                onClick={resetScanner}
                class="flex-1 py-2.5 border border-gray-200 dark:border-darkbg-700 rounded-xl font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkbg-900/50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw size={14} /> Rescan
              </button>
              <Link
                to="/roadmap"
                class="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Map size={14} /> Study Path
              </Link>
            </div>
          </div>

          {/* Detailed Skill & Suggestions Panels */}
          <div class="lg:col-span-2 space-y-6">
            {/* Identified Skills */}
            <div class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
              <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Award class="text-primary-500" size={18} /> Identified Skills
              </h3>
              <div class="flex flex-wrap gap-2">
                {resumeData.analysis?.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    class="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1"
                  >
                    <CheckCircle size={12} /> {skill}
                  </span>
                )) || <p class="text-xs text-gray-400">No skills identified.</p>}
              </div>
            </div>

            {/* Skill Gaps */}
            <div class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
              <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <AlertTriangle class="text-yellow-500" size={18} /> Identified Skill Gaps
              </h3>
              <div class="flex flex-wrap gap-2">
                {resumeData.analysis?.gaps?.map((gap, idx) => (
                  <span
                    key={idx}
                    class="px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1"
                  >
                    <AlertTriangle size={12} /> {gap}
                  </span>
                )) || <p class="text-xs text-gray-400">No major gaps detected.</p>}
              </div>
            </div>

            {/* Suggestions */}
            <div class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
              <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <HelpCircle class="text-primary-500" size={18} /> ATS Optimizations
              </h3>
              <ul class="space-y-2.5">
                {resumeData.analysis?.atsSuggestions?.map((sug, idx) => (
                  <li key={idx} class="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2.5 leading-relaxed">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0"></span>
                    <span>{sug}</span>
                  </li>
                )) || <li class="text-xs text-gray-400">No suggestions available.</li>}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeAnalysis;
