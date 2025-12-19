'use client';

import React from 'react';

interface SmoothInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function SmoothInput({
  label,
  error,
  icon,
  className = '',
  ...props
}: SmoothInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2.5 rounded-lg
            border-2 border-slate-200 dark:border-slate-700
            bg-white dark:bg-slate-800
            text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            transition-all duration-200 ease-out
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            hover:border-slate-300 dark:hover:border-slate-600
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
