import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingState from '../components/LoadingState';
import { 
  Users, 
  FileCheck, 
  Tv, 
  Search, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/admin/users');
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error('Error fetching admin users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <LoadingState message="Loading platform users data..." />;

  // Filter query
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.targetJob?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Aggregated Stats
  const totalCandidates = users.filter(u => u.role === 'candidate').length;
  const totalInterviews = users.reduce((acc, u) => acc + u.interviewsCount, 0);
  const systemAvgScore = totalInterviews > 0
    ? Math.round(users.reduce((acc, u) => acc + (u.avgScore * u.interviewsCount), 0) / totalInterviews)
    : 0;

  return (
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <div class="border-b border-gray-200 dark:border-darkbg-700 pb-4">
        <h1 class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          Administrator Console <ShieldAlert class="text-red-500" size={24} />
        </h1>
        <p class="text-sm text-gray-400 mt-1">Monitor platform usage metrics and candidate placement stats</p>
      </div>

      {/* Admin stats */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Candidates Registered</span>
            <h3 class="text-3xl font-extrabold mt-1 text-gray-800 dark:text-gray-100">{totalCandidates}</h3>
          </div>
          <div class="p-4 rounded-xl bg-primary-500/10 text-primary-500">
            <Users size={24} />
          </div>
        </div>

        <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Rounds Conducted</span>
            <h3 class="text-3xl font-extrabold mt-1 text-gray-800 dark:text-gray-100">{totalInterviews}</h3>
          </div>
          <div class="p-4 rounded-xl bg-green-500/10 text-green-500">
            <Tv size={24} />
          </div>
        </div>

        <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">System Avg Score</span>
            <h3 class="text-3xl font-extrabold mt-1 text-gray-800 dark:text-gray-100">{systemAvgScore}%</h3>
          </div>
          <div class="p-4 rounded-xl bg-yellow-500/10 text-yellow-500">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* User filtering control */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-darkbg-800 rounded-2xl border border-gray-200 dark:border-darkbg-700">
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates by name, email, or job target..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-gray-50 dark:bg-darkbg-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs text-gray-850"
          />
        </div>
      </div>

      {/* Candidates List Table */}
      <div class="p-6 rounded-2xl border border-gray-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 shadow-sm">
        <h3 class="font-bold text-base text-gray-800 dark:text-gray-200 mb-4">Candidate Index</h3>
        {filteredUsers.length > 0 ? (
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-darkbg-700 text-xs text-gray-400 uppercase font-bold">
                  <th class="py-3 px-4">Name</th>
                  <th class="py-3 px-4">Email</th>
                  <th class="py-3 px-4">Target Job</th>
                  <th class="py-3 px-4">ATS Match</th>
                  <th class="py-3 px-4">Rounds Completed</th>
                  <th class="py-3 px-4">Avg Score</th>
                  <th class="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-darkbg-700 text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u.id} class="hover:bg-gray-50/50 dark:hover:bg-darkbg-700/20 transition-colors">
                    <td class="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div class="h-7 w-7 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td class="py-3.5 px-4 text-xs text-gray-650 dark:text-gray-400">{u.email}</td>
                    <td class="py-3.5 px-4 text-gray-600 dark:text-gray-400">{u.targetJob}</td>
                    <td class="py-3.5 px-4 font-bold">
                      {u.atsScore ? (
                        <span class="text-emerald-500">{u.atsScore}%</span>
                      ) : (
                        <span class="text-gray-400 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">{u.interviewsCount}</td>
                    <td class="py-3.5 px-4 font-bold text-gray-800 dark:text-gray-200">{u.avgScore}%</td>
                    <td class="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div class="py-8 text-center text-xs text-gray-400">
            No registered users found matching the query parameters.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
