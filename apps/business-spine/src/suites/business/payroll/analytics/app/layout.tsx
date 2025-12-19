
import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Ops Suite", description: "HR, Payroll, Ops, Bookkeeping" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="brand">Ops Suite</div>
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/hr/employees">HR</Link>
            <Link href="/time/timesheets">Timesheets</Link>
            <Link href="/payroll/runs">Payroll</Link>
            <Link href="/ops/tasks">Ops</Link>
            <Link href="/books/accounts">Books</Link>
            <Link href="/books/reports">Reports</Link>
            <Link href="/analytics">Analytics</Link>
            <Link href="/admin/audit">Audit</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
