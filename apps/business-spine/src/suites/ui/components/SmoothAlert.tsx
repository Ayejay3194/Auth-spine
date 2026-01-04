'use client';

import React from 'react';

interface SmoothAlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning' | 'info' | 'success';
  className?: string;
}

interface SmoothAlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export default function SmoothAlert({ 
  children, 
  variant = 'default',
  className = '' 
}: SmoothAlertProps) {
  const baseClasses = 'relative w-full rounded-xl border p-4 transition-all duration-200 ease-out';
  
  const variants = {
    default: 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700',
    destructive: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
  };
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function SmoothAlertDescription({ 
  children, 
  className = '' 
}: SmoothAlertDescriptionProps) {
  return (
    <div className={`text-sm text-slate-600 dark:text-slate-300 ${className}`}>
      {children}
    </div>
  );
}
