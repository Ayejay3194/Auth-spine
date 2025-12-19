import Link from "next/link";

export default function Dashboard() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <ul>
        <li><Link href="/dashboard/booking">Booking</Link></li>
        <li><Link href="/dashboard/staff">Staff</Link></li>
        <li><Link href="/dashboard/loyalty">Loyalty</Link></li>
        <li><Link href="/dashboard/automation">Automation</Link></li>
      </ul>
    </main>
  );
}
