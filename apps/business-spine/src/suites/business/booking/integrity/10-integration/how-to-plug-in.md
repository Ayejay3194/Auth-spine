HOW TO PLUG THIS INTO YOUR SPINE
================================

1) Drop folders into your repo:
- policy engine
- disputes
- conflicts
- reliability scoring
- booking integrity
- timezone/DST checks
- refunds detection
- capacity protection
- simulation mode

2) Wire the events:
- booking.created / updated / cancelled / completed
- dispute.opened / updated / resolved
- payout.requested / held / released / failed
- refund.created
- policy.changed
- score.updated

3) Turn on via feature flags:
- instant payout throttle by risk
- strict cancellation policy
- simulation mode
