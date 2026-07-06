import React from 'react';

const LoadingState = ({ message = 'Analyzing...' }) => {
  return (
    <div class="flex flex-col items-center justify-center p-8 gap-4 min-h-[300px]">
      <div class="relative w-16 h-16">
        {/* Outer Ring */}
        <div class="absolute inset-0 rounded-full border-4 border-primary-500/20"></div>
        {/* Spinning Ring */}
        <div class="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
