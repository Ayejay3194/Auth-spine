'use client';

import React from 'react';

interface CupertinoSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export default function CupertinoSkeleton({
  className = '',
  width,
  height,
  variant = 'text'
}: CupertinoSkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded-full',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  return (
    <div
      className={`
        cupertino-skeleton
        ${variantClasses[variant]}
        ${className}
      `}
      style={{ width, height }}
    />
  );
}
