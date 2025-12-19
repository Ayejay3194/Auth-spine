'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-75 blur animate-pulse"></div>
        <div className={`${sizeClasses[size]} border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin`}></div>
      </div>
      {text && <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
}
