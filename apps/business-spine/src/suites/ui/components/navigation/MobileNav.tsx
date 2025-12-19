'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/src/providers/AppContext';
import { Menu, X } from 'lucide-react';
import { ROUTES } from '@/src/lib/routes';

export default function MobileNav() {
  const pathname = usePathname();
  const { ui, setMobileNavOpen } = useAppContext();

  return (
    <div className="flex items-center justify-between h-16 px-4">
      <Link href={ROUTES.HOME} className="text-lg font-bold text-slate-900 dark:text-white">
        Auth-Spine
      </Link>

      <button
        onClick={() => setMobileNavOpen(!ui.mobileNavOpen)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        {ui.mobileNavOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {ui.mobileNavOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 space-y-2 max-h-[calc(100vh-64px)] overflow-y-auto">
          <Link
            href={ROUTES.DASHBOARD}
            className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileNavOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href={ROUTES.ADMIN_USERS}
            className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileNavOpen(false)}
          >
            Admin
          </Link>
          <Link
            href={ROUTES.PAYROLL}
            className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileNavOpen(false)}
          >
            Payroll
          </Link>
          <Link
            href={ROUTES.SWAGGER}
            className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileNavOpen(false)}
          >
            API Docs
          </Link>
        </div>
      )}
    </div>
  );
}
