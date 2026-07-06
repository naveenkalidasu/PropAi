import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav class="glass sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-darkbg-700 bg-white/70 dark:bg-darkbg-800/70 transition-all duration-300">
      <div class="flex items-center gap-2">
        <Link to="/" class="flex items-center gap-2">
          <svg class="h-8 w-8 text-primary-500 animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h20L12 2zm0 3.99L18.8 19H5.2L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/>
          </svg>
          <span class="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-400">
            PrepAI
          </span>
        </Link>
      </div>

      <div class="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          class="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-darkbg-700 dark:hover:bg-darkbg-600 transition-colors text-gray-700 dark:text-gray-200"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {user && (
          <div class="flex items-center gap-3 border-l border-gray-200 dark:border-darkbg-700 pl-4">
            <div class="hidden md:flex flex-col text-right">
              <span class="font-medium text-sm text-gray-800 dark:text-gray-200">{user.name}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
            </div>
            
            <div class="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={logoutUser}
              class="p-2 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
