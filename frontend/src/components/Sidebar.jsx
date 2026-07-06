import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserCircle, 
  FileSearch, 
  Map, 
  Tv, 
  Award, 
  Settings,
  Lock
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'My Profile', path: '/profile', icon: <UserCircle size={20} /> },
    { name: 'Resume Scan', path: '/resume', icon: <FileSearch size={20} /> },
    { name: 'Study Path', path: '/roadmap', icon: <Map size={20} /> },
    { name: 'Mock Interview', path: '/interview', icon: <Tv size={20} /> },
    { name: 'Practice Arena', path: '/practice', icon: <Award size={20} /> },
  ];

  if (user && user.role === 'admin') {
    links.push({ name: 'Admin Panel', path: '/admin', icon: <Lock size={20} /> });
  }

  return (
    <aside class="glass w-64 h-[calc(100vh-73px)] border-r border-gray-200 dark:border-darkbg-700 bg-white/70 dark:bg-darkbg-800/70 p-4 flex flex-col justify-between hidden md:flex">
      <div class="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            class={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300
              ${isActive 
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkbg-700/50 hover:text-primary-500'
              }
            `}
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </div>

      <div class="p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-indigo-500/10 border border-primary-500/20 text-center">
        <h4 class="font-semibold text-xs text-primary-500 dark:text-primary-400 mb-1">Placement Ready?</h4>
        <p class="text-[10px] text-gray-500 dark:text-gray-400">Keep scanning your resume and completing interviews to score higher!</p>
      </div>
    </aside>
  );
};

export default Sidebar;
