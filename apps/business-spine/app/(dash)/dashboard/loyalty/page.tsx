export default function LoyaltyDash() {
  return (
    <main style={{ padding: 24 }}>
      <h2>Loyalty + Referrals + Gift Cards</h2>
      <ul>
        <li>POST /api/loyalty/points/add</li>
        <li>POST /api/referrals/create</li>
        <li>POST /api/giftcards/create</li>
        <li>POST /api/giftcards/redeem</li>
      </ul>
    </main>
  );
}
