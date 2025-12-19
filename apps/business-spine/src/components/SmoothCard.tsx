'use client';

import React from 'react';

interface SmoothCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function SmoothCard({
  children,
  className = '',
  hoverable = false,
  onClick
}: SmoothCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-900
        rounded-xl
        border border-slate-200 dark:border-slate-800
        shadow-sm
        transition-all duration-200 ease-out
        ${hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
