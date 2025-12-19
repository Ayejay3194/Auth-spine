'use client';

import React from 'react';
import { useAppContext } from '@/src/providers/AppContext';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const iconMap = {
  success: <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
};

const bgMap = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg shadow-green-500/10',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg shadow-red-500/10',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/10',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-lg shadow-yellow-500/10',
};

export default function Notifications() {
  const { ui, removeNotification } = useAppContext();

  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-50 max-w-sm pointer-events-none">
      {ui.notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg border
            ${bgMap[notification.type]}
            animate-in fade-in slide-in-from-right-4 duration-300
            pointer-events-auto
            transition-all duration-300 ease-out
            hover:shadow-xl
          `}
        >
          <div className="flex-shrink-0 mt-0.5">
            {iconMap[notification.type]}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
