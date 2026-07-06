import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import { 
  Tv, 
  FileCheck, 
  TrendingUp, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  FileWarning
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Initialize Score Chart
  useEffect(() => {
    if (data && data.reports && data.reports.length > 0 && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      // Destroy old instance to avoid overlap
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Reverse reports to display chronologically (oldest to newest)
      const chartReports = [...data.reports].reverse();
      const labels = chartReports.map(r => new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      const scores = chartReports.map(r => r.overallScore);

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Interview Score Trend',
            data: scores,
            borderColor: '#4f68ff',
            backgroundColor: 'rgba(79, 104, 255, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#4f68ff',
            pointRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (loading) return <LoadingState message="Loading dashboard statistics..." />;

  const { stats, reports, weakAreas, recentPractice, latestResume } = data || {};

  return (
    <div class="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-xl">
        <div>
          <h1 class="text-3xl font-extrabold flex items-center gap-2">
            Placement Dashboard <Sparkles class="animate-bounce text-yellow-300" size={24} />
          </h1>
          <p class="text-sm opacity-90 mt-1">
            Build your skills for a role as a <span class="font-bold underline">{stats?.targetJob || 'Software Engineer'}</span>.
          </p>
        </div>
        <Link 
          to="/interview"
          class="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary-600 font-bold hover:bg-gray-100 transition-all text-sm w-fit self-start md:self-auto shadow-md"
        >
          Start Mock Session <ArrowRight size={16} />
        </Link>
      </div>

      {/* Grid Statistics */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Interviews Conducted */}
        <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Interviews Completed</span>
            <h3 class="text-3xl font-extrabold mt-1 text-gray-800 dark:text-gray-100">{stats?.totalInterviews || 0}</h3>
          </div>
          <div class="p-4 rounded-xl bg-primary-500/10 text-primary-500">
            <Tv size={24} />
          </div>
        </div>

        {/* Avg Performance Score */}
        <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Average AI Score</span>
            <h3 class="text-3xl font-extrabold mt-1 text-gray-800 dark:text-gray-100">{stats?.averageScore || 0}%</h3>
          </div>
          <div class="p-4 rounded-xl bg-green-500/10 text-green-500">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Roadmap Progress */}
        <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Study Path Progress</span>
            <h3 class="text-3xl font-extrabold mt-1 text-gray-800 dark:text-gray-100">{stats?.roadmapProgress || 0}%</h3>
          </div>
          <div class="p-4 rounded-xl bg-blue-500/10 text-blue-500">
            <BookOpen size={24} />
          </div>
        </div>

        {/* ATS Score */}
        <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Resume ATS Match</span>
            <h3 class="text-3xl font-extrabold mt-1 text-gray-800 dark:text-gray-100">{stats?.atsScore ? `${stats.atsScore}%` : 'Not Scanned'}</h3>
          </div>
          <div class="p-4 rounded-xl bg-yellow-500/10 text-yellow-500">
            <FileCheck size={24} />
          </div>
        </div>
      </div>

      {/* Resume Scan Banner Warning */}
      {!latestResume && (
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-800 dark:text-yellow-200">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-yellow-500/20 text-yellow-600 rounded-xl">
              <FileWarning size={24} />
            </div>
            <div>
              <h4 class="font-bold text-sm">Resume parsing and analysis is pending!</h4>
              <p class="text-xs opacity-90 mt-0.5">Upload your PDF resume to calculate your ATS match score and automatically generate a personalized study roadmap.</p>
            </div>
          </div>
          <Link
            to="/resume"
            class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl text-xs transition-colors self-start md:self-auto shadow-sm"
          >
            Scan Resume
          </Link>
        </div>
      )}

      {/* Chart and Weak Areas Panel */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Score Trend Chart */}
        <div class="lg:col-span-2 p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex flex-col justify-between">
          <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 mb-4">Performance Progress</h3>
          <div class="h-64 w-full relative">
            {reports && reports.length > 0 ? (
              <canvas ref={chartRef}></canvas>
            ) : (
              <div class="h-full w-full flex items-center justify-center text-xs text-gray-400">
                Complete a mock interview to visualize your score history trend.
              </div>
            )}
          </div>
        </div>

        {/* Weak Areas Card */}
        <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 mb-1">Focus Areas</h3>
            <p class="text-xs text-gray-400 mb-4">Core concepts flagged by AI evaluations for review</p>
            {weakAreas && weakAreas.length > 0 ? (
              <div class="space-y-2">
                {weakAreas.map((area, i) => (
                  <div key={i} class="px-3 py-2 rounded-xl bg-gray-50 dark:bg-darkbg-900 border border-gray-100 dark:border-darkbg-700 text-xs font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center">
                    <span>{area}</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  </div>
                ))}
              </div>
            ) : (
              <div class="h-40 flex items-center justify-center text-xs text-gray-400 text-center">
                Good job! No critical weak areas flagged yet. Complete mock rounds to test skills.
              </div>
            )}
          </div>
          <Link
            to="/practice"
            class="mt-4 w-full py-2.5 rounded-xl border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 text-primary-500 font-bold text-xs text-center transition-colors block"
          >
            Practice Selected Topics
          </Link>
        </div>
      </div>

      {/* Recent Interviews History Table */}
      <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-base text-gray-800 dark:text-gray-200">Recent Interview Reports</h3>
          <Link to="/interview" class="text-xs font-bold text-primary-500 hover:underline">View All</Link>
        </div>
        {reports && reports.length > 0 ? (
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-darkbg-700 text-xs text-gray-400 uppercase font-bold">
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Type</th>
                  <th class="py-3 px-4">Target Job</th>
                  <th class="py-3 px-4">Overall Score</th>
                  <th class="py-3 px-4">Recommendation</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-darkbg-700 text-sm">
                {reports.slice(0, 5).map((r) => (
                  <tr key={r.id} class="hover:bg-gray-50/50 dark:hover:bg-darkbg-700/20 transition-colors">
                    <td class="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td class="py-3 px-4 capitalize font-semibold text-gray-700 dark:text-gray-300">
                      {r.type === 'mock' ? 'Interactive Mock' : `${r.type} Round`}
                    </td>
                    <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{r.role}</td>
                    <td class="py-3 px-4 font-bold text-gray-800 dark:text-gray-200">{r.overallScore}%</td>
                    <td class="py-3 px-4">
                      <span class={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider
                        ${r.finalRecommendation === 'HIRE' ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' : ''}
                        ${r.finalRecommendation === 'CONSIDER' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400' : ''}
                        ${r.finalRecommendation === 'REJECT' ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' : ''}
                      `}>
                        {r.finalRecommendation}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <Link
                        to={`/reports/${r.interviewId}`}
                        class="text-xs font-bold text-primary-500 hover:text-primary-600"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div class="py-8 text-center text-xs text-gray-400">
            No interviews conducted yet. Choose an option to start a mock interview.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
