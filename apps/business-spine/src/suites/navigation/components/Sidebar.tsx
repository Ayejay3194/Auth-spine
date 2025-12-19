'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../core/providers/AppContext';
import { ROUTES, NAVIGATION_ITEMS, isRouteActive } from '../../core/lib/routes';
import {
  Home,
  Users,
  Settings,
  Shield,
  Activity,
  DollarSign,
  Wrench,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

const iconMap = {
  home: <Home className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  settings: <Settings className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  activity: <Activity className="w-5 h-5" />,
  dollar: <DollarSign className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { ui, setSidebarOpen } = useAppContext();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['admin']));

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderNavigationItem = (item: any, level = 0) => {
    const isActive = isRouteActive(pathname, item.href);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              // Navigate to the route
              window.location.href = item.href;
            }
          }}
          className={`
            w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200
            ${isActive 
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }
            ${level > 0 ? 'ml-4' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            {item.icon && (
              <div className="flex-shrink-0">
                {iconMap[item.icon as keyof typeof iconMap] || <div className="w-5 h-5" />}
              </div>
            )}
            <span className="truncate">{item.label}</span>
          </div>
          {hasChildren && (
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map((child: any) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Auth-Spine
        </h2>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {NAVIGATION_ITEMS.map(item => renderNavigationItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              Admin User
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              admin@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
