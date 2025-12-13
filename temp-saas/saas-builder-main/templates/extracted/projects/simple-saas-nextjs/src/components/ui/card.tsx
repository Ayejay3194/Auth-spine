import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-slate-800 bg-slate-900/60 p-4', className)}>
      {children}
    </div>
  );
}
