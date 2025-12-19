'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAVIGATION_ITEMS, isRouteActive } from '@/src/lib/routes';
import { useAppContext } from '@/src/providers/AppContext';
import {
  LayoutDashboard,
  Shield,
  DollarSign,
  BookOpen,
  ChevronDown,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { ui } = useAppContext();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  return (
    <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Auth-Spine
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enterprise Platform
        </p>
      </div>

      {NAVIGATION_ITEMS.map((item) => {
        const isActive = isRouteActive(pathname, item.href);
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.href);

        return (
          <div key={item.href}>
            <div className="flex items-center">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(item.href)}
                  className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {iconMap[item.icon]}
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.label}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {iconMap[item.icon]}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )}
            </div>

            {hasChildren && isExpanded && (
              <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                {item.children!.map((child) => {
                  const isChildActive = isRouteActive(pathname, child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        isChildActive
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
