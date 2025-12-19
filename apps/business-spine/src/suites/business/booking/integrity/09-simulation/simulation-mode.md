BOOKING SIMULATION MODE (ADMIN)
===============================

Purpose: test policy changes without production damage.

Simulate:
- booking creation
- cancellation at different lead times
- no-show
- dispute opening
- payout release/hold
- refund issuance

Outputs:
- charges/payouts summary
- policy evaluation trace
- risk score impact
- notifications that would fire

Security:
- admin-only
- cannot mutate production data
- all simulations logged
