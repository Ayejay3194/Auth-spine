import Link from 'next/link';

export default function DashboardHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-slate-300">
        This is your dashboard. Your first real feature lives in{' '}
        <Link href="/dashboard/projects" className="underline">
          Projects
        </Link>
        .
      </p>
    </div>
  );
}
