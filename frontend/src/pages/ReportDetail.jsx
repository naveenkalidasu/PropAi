import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import { 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  FileCode,
  Calendar,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

const ReportDetail = () => {
  const { interviewId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/interview/report/${interviewId}`);
        if (res.data.success) {
          setReport(res.data.report);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [interviewId]);

  if (loading) return <LoadingState message="Loading performance report..." />;

  if (!report) {
    return (
      <div class="p-6 text-center space-y-4">
        <h2 class="text-xl font-bold text-red-500">Report Not Found</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400">Could not retrieve interview feedback data.</p>
        <Link to="/" class="px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-semibold">Back Home</Link>
      </div>
    );
  }

  const toggleAnswerExpand = (idx) => {
    setExpandedAnswer(expandedAnswer === idx ? null : idx);
  };

  return (
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      {/* Return header */}
      <Link to="/" class="flex items-center gap-1 text-xs font-bold text-primary-500 hover:underline">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Main Header card */}
      <div class="p-6 rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span class="px-3 py-1 bg-white/20 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
              {report.type === 'mock' ? 'Interactive Mock' : `${report.type} Session`}
            </span>
            <h1 class="text-3xl font-extrabold mt-2 flex items-center gap-2">
              Performance Scorecard <Award size={28} />
            </h1>
            <div class="flex flex-wrap items-center gap-4 text-xs opacity-90 mt-2">
              <span class="flex items-center gap-1"><Briefcase size={14} /> {report.role}</span>
              <span class="flex items-center gap-1"><Calendar size={14} /> {new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div class="flex items-center gap-4 bg-white/10 p-3 rounded-2xl border border-white/10 self-start md:self-auto">
            <div class="text-center px-4 border-r border-white/20">
              <span class="text-[9px] font-bold uppercase tracking-wider opacity-70">Overall Score</span>
              <h3 class="text-3xl font-black">{report.overallScore}%</h3>
            </div>
            <div class="text-center px-2">
              <span class="text-[9px] font-bold uppercase tracking-wider opacity-70">Recommendation</span>
              <div class={`mt-1 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider
                ${report.finalRecommendation === 'HIRE' ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : ''}
                ${report.finalRecommendation === 'CONSIDER' ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20' : ''}
                ${report.finalRecommendation === 'REJECT' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : ''}
              `}>
                {report.finalRecommendation}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
          <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <CheckCircle class="text-green-500" size={18} /> Top Strengths
          </h3>
          <ul class="space-y-3">
            {report.strengths?.map((str, idx) => (
              <li key={idx} class="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
            {(!report.strengths || report.strengths.length === 0) && (
              <p class="text-xs text-gray-400 italic">No metrics analyzed.</p>
            )}
          </ul>
        </div>

        {/* Weaknesses Card */}
        <div class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
          <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <AlertTriangle class="text-red-500" size={18} /> Gaps & Weak Areas
          </h3>
          <ul class="space-y-3">
            {report.weaknesses?.map((wk, idx) => (
              <li key={idx} class="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                <span>{wk}</span>
              </li>
            ))}
            {(!report.weaknesses || report.weaknesses.length === 0) && (
              <p class="text-xs text-gray-400 italic">No gaps analyzed.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Improvement Action Items */}
      <div class="p-6 rounded-3xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm space-y-4">
        <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Sparkles class="text-primary-500" size={18} /> Roadmap for Improvement
        </h3>
        <ul class="space-y-3">
          {report.improvementTips?.map((tip, idx) => (
            <li key={idx} class="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-3 leading-relaxed">
              <span class="px-2 py-0.5 rounded bg-primary-500/10 text-primary-500 font-bold text-[10px] mt-0.5">
                {idx + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
          {(!report.improvementTips || report.improvementTips.length === 0) && (
            <p class="text-xs text-gray-400 italic">No action items available.</p>
          )}
        </ul>
      </div>

      {/* Question Accordion details */}
      <div class="space-y-4">
        <h3 class="font-extrabold text-lg text-gray-800 dark:text-gray-200">Question-by-Question Transcript</h3>

        <div class="space-y-3">
          {report.answers?.map((ans, idx) => (
            <div 
              key={ans._id} 
              class="rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 overflow-hidden shadow-sm"
            >
              {/* Accordion header */}
              <div 
                onClick={() => toggleAnswerExpand(idx)}
                class="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-darkbg-700/10 select-none transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span class="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-md md:max-w-xl">
                    {ans.questionText}
                  </span>
                </div>

                <div class="flex items-center gap-4">
                  <span class="text-xs font-extrabold text-primary-500">
                    {ans.evaluation ? `${ans.evaluation.score}/100` : 'Not Rated'}
                  </span>
                  {expandedAnswer === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Accordion content */}
              {expandedAnswer === idx && (
                <div class="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-darkbg-700 space-y-4">
                  {/* Question prompt block */}
                  <div class="space-y-1">
                    <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Question Prompt</span>
                    <p class="text-xs text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-darkbg-900/50 p-3 rounded-xl">
                      {ans.questionText}
                    </p>
                  </div>

                  {/* Candidate Answer/Code block */}
                  <div class="space-y-1">
                    <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Your Answer</span>
                    {ans.questionType === 'coding' ? (
                      <div class="relative rounded-xl overflow-hidden border border-gray-200 dark:border-darkbg-700 font-mono text-[11px] bg-darkbg-900 text-gray-300 p-4">
                        <span class="absolute top-2 right-2 px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold capitalize text-gray-400">
                          {ans.codeLanguage}
                        </span>
                        <pre class="overflow-x-auto">{ans.answerText}</pre>
                      </div>
                    ) : (
                      <p class="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-darkbg-900/50 p-3 rounded-xl">
                        {ans.answerText}
                      </p>
                    )}
                  </div>

                  {/* AI Evaluation */}
                  {ans.evaluation && (
                    <div class="space-y-3 border-t border-gray-100 dark:border-darkbg-700/50 pt-3">
                      <div class="space-y-1">
                        <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">AI Assessment Comments</span>
                        <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                          "{ans.evaluation.comments}"
                        </p>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                          <span class="text-[9px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle size={10} /> Strengths Shown
                          </span>
                          <ul class="space-y-1">
                            {ans.evaluation.strengths?.map((str, sIdx) => (
                              <li key={sIdx} class="text-[10px] text-gray-500 dark:text-gray-400 flex items-start gap-1">
                                <span class="w-1 h-1 bg-green-500 rounded-full mt-1.5 shrink-0"></span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div class="space-y-1.5">
                          <span class="text-[9px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle size={10} /> Bugs / Suggestions
                          </span>
                          <ul class="space-y-1">
                            {ans.evaluation.weaknesses?.map((wk, wIdx) => (
                              <li key={wIdx} class="text-[10px] text-gray-500 dark:text-gray-400 flex items-start gap-1">
                                <span class="w-1 h-1 bg-red-500 rounded-full mt-1.5 shrink-0"></span>
                                <span>{wk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Code Optimizations / Suggested Answer */}
                      <div class="space-y-1.5">
                        <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <FileCode size={12} /> Ideal Reference Code / Guidelines
                        </span>
                        {ans.questionType === 'coding' ? (
                          <pre class="text-[10px] text-gray-300 bg-darkbg-900 p-4 rounded-xl overflow-x-auto font-mono whitespace-pre-wrap">
                            {ans.evaluation.correctAnswerSuggested}
                          </pre>
                        ) : (
                          <p class="text-[10.5px] text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-darkbg-900/50 p-3.5 rounded-xl">
                            {ans.evaluation.correctAnswerSuggested}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
