# Billing & Payments Controls

## Payment processing
- Use a payment processor (no card storage)
- Verify webhook signatures
- Idempotency keys on charges
- Transactional subscription state updates
- Reconciliation job (processor → internal ledger)
- Refund flow tested
- Duplicate charge prevention
- Tax calculations tested

## Subscription state machine
- Single source of truth for status
- Grace periods + dunning
- Access gating based on plan + status
- Trial enforcement
- Upgrade/downgrade proration tested
- Cancellation tested (immediate vs end-of-period)

## Fraud
- Velocity limits
- Risk scoring signals
- Chargeback monitoring
