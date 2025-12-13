import Link from 'next/link';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      <aside className="w-60 border-r border-slate-800 p-4 space-y-4">
        <div className="text-lg font-semibold">Simple SaaS</div>
        <nav className="space-y-2 text-sm">
          <Link href="/dashboard" className="block hover:underline">
            Dashboard
          </Link>
          <Link href="/dashboard/projects" className="block hover:underline">
            Projects
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
