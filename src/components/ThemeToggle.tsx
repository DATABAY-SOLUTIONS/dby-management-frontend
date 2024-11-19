import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useAuthStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <Sun
          className={`absolute inset-0 h-6 w-6 transition-all duration-300 
            ${theme === 'light' 
              ? 'transform rotate-0 opacity-100' 
              : 'transform rotate-90 opacity-0'
            }`}
        />
        <Moon
          className={`absolute inset-0 h-6 w-6 transition-all duration-300 
            ${theme === 'dark'
              ? 'transform rotate-0 opacity-100'
              : 'transform -rotate-90 opacity-0'
            }`}
        />
      </div>
    </button>
  );
};