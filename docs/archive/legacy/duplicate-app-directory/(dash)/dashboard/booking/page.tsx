export default function BookingDash() {
  return (
    <main style={{ padding: 24 }}>
      <h2>Booking Ops</h2>
      <ul>
        <li>POST /api/booking/gapfill</li>
        <li>POST /api/booking/waitlist/add</li>
        <li>POST /api/booking/waitlist/match</li>
      </ul>
    </main>
  );
}
