'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
}

export function LoadingButton({ 
  isLoading, 
  children, 
  disabled = false, 
  className = '',
  loadingText = 'Loading...'
}: LoadingButtonProps) {
  return (
    <button
      className={`${className} transition-all duration-200`}
      disabled={disabled || isLoading}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && <LoadingSpinner size="sm" />}
        {isLoading ? loadingText : children}
      </div>
    </button>
  );
}

interface LoadingCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  height?: string;
}

export function LoadingCard({ isLoading, children, className = '', height = '200px' }: LoadingCardProps) {
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`} style={{ height }}>
        <div className="h-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

interface LoadingTableProps {
  isLoading: boolean;
  headers: string[];
  rows?: number;
  className?: string;
}

export function LoadingTable({ isLoading, headers, rows = 5, className = '' }: LoadingTableProps) {
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  >
                    <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-20 animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null; // Render actual table content when not loading
}

interface LoadingFormProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingForm({ isLoading, children, className = '' }: LoadingFormProps) {
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Processing...</p>
          </div>
        </div>
      )}
      <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
}

interface LoadingPageProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export function LoadingPage({ isLoading, children, message = 'Loading...' }: LoadingPageProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-lg text-slate-600 dark:text-slate-400">{message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string;
  height?: string;
}

export function LoadingSkeleton({ 
  className = '', 
  variant = 'text',
  width = '100%',
  height = '1rem'
}: LoadingSkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  return (
    <div 
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = React.useCallback(async <T,>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    try {
      startLoading();
      return await asyncFn();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}

// Higher-order component for loading states
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  loadingProp: string = 'isLoading'
) {
  return function WithLoadingComponent(props: P & { isLoading?: boolean }) {
    const { [loadingProp]: isLoading, ...rest } = props;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return <Component {...(rest as P)} />;
  };
}
