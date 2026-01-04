'use client';

import React, { useState } from 'react';

interface SmoothTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
}

interface SmoothTabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface SmoothTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SmoothTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export default function SmoothTabs({ 
  children, 
  defaultValue,
  className = '' 
}: SmoothTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || '');
  
  return (
    <div className={className}>
      {React.Children.map(children, (child: React.ReactNode) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
}

export function SmoothTabsList({ 
  children, 
  className = '',
  activeTab,
  setActiveTab 
}: SmoothTabsListProps & { activeTab?: string; setActiveTab?: (value: string) => void }) {
  return (
    <div className={`inline-flex h-11 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${className}`}>
      {React.Children.map(children, (child: React.ReactNode) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
}

export function SmoothTabsTrigger({ 
  value, 
  children, 
  className = '',
  activeTab,
  setActiveTab 
}: SmoothTabsTriggerProps & { activeTab?: string; setActiveTab?: (value: string) => void }) {
  const isActive = activeTab === value;
  
  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100' 
          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function SmoothTabsContent({ 
  value, 
  children, 
  className = '',
  activeTab 
}: SmoothTabsContentProps & { activeTab?: string }) {
  if (activeTab !== value) {
    return null;
  }
  
  return (
    <div className={`mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
