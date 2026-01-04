'use client';

import React from 'react';

interface SmoothSeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export default function SmoothSeparator({ 
  orientation = 'horizontal',
  className = '' 
}: SmoothSeparatorProps) {
  const baseClasses = 'shrink-0 bg-slate-200 dark:bg-slate-700 transition-colors duration-200';
  const orientationClasses = orientation === 'horizontal' 
    ? 'h-[1px] w-full' 
    : 'h-full w-[1px]';
  
  return (
    <div className={`${baseClasses} ${orientationClasses} ${className}`} />
  );
}
