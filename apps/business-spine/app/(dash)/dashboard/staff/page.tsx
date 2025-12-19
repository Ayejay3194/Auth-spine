export default function StaffDash() {
  return (
    <main style={{ padding: 24 }}>
      <h2>Staff + Commissions</h2>
      <ul>
        <li>POST /api/staff/add</li>
        <li>POST /api/staff/commission/rules/set</li>
        <li>POST /api/staff/commission/post</li>
      </ul>
    </main>
  );
}
