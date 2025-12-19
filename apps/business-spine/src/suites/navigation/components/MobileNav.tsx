'use client';

import React from 'react';
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

export default function MobileNav() {
  const pathname = usePathname();
  const { ui, setMobileNavOpen } = useAppContext();

  const handleNavClick = (href: string) => {
    window.location.href = href;
    setMobileNavOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileNavOpen(!ui.mobileNavOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {ui.mobileNavOpen ? (
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          )}
        </button>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          Auth-Spine
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">A</span>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {ui.mobileNavOpen && (
        <div className="fixed inset-0 top-16 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <nav className="p-4 space-y-2">
            {NAVIGATION_ITEMS.map(item => {
              const isActive = isRouteActive(pathname, item.href);
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    {item.icon && (
                      <div className="flex-shrink-0">
                        {iconMap[item.icon as keyof typeof iconMap] || <div className="w-5 h-5" />}
                      </div>
                    )}
                    <span>{item.label}</span>
                  </button>

                  {/* Render children if active */}
                  {isActive && item.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map(child => {
                        const isChildActive = isRouteActive(pathname, child.href);
                        
                        return (
                          <button
                            key={child.id}
                            onClick={() => handleNavClick(child.href)}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200
                              ${isChildActive 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }
                            `}
                          >
                            {child.icon && (
                              <div className="flex-shrink-0">
                                {iconMap[child.icon as keyof typeof iconMap] || <div className="w-5 h-5" />}
                              </div>
                            )}
                            <span>{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
