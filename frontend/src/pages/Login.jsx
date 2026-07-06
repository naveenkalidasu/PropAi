import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div class="min-h-[calc(100vh-73px)] flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-darkbg-900 dark:to-darkbg-800 transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        class="w-full max-w-md p-8 rounded-3xl glass shadow-glass border border-white/20 dark:border-white/5 bg-white/80 dark:bg-darkbg-800/80"
      >
        <div class="text-center mb-8">
          <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Log in to continue your placement preparation
          </p>
        </div>

        {error && (
          <div class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-500 flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-5">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@university.edu"
                class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-gray-50 dark:bg-darkbg-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-gray-50 dark:bg-darkbg-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full mt-2 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" class="text-primary-500 hover:underline font-semibold">
            Register Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
