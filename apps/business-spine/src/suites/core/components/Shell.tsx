'use client';

import React from 'react';
import { useAppContext } from '../providers/AppContext';
import Sidebar from '../../navigation/components/Sidebar';
import MobileNav from '../../navigation/components/MobileNav';
import Notifications from '../../navigation/components/Notifications';
import '../../../styles/animations.css';

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { ui, setMobileNavOpen } = useAppContext();

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 md:dark:border-slate-800 md:transition-all md:duration-300">
        <Sidebar />
      </aside>

      {/* Mobile Navigation - visible only on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <MobileNav />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Mobile top padding for fixed nav */}
        <div className="md:hidden h-16" />

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto scroll-smooth">
          <div className="transition-opacity duration-300">
            {children}
          </div>
        </div>
      </main>

      {/* Notifications */}
      <Notifications />

      {/* Mobile nav overlay when open */}
      {ui.mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30 transition-opacity duration-200 animate-in fade-in"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
    </div>
  );
}
