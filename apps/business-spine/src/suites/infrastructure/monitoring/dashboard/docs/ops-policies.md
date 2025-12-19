Ops Policies (Portable)
======================

Receipts-first
--------------
Every number and sensitive action must be traceable:
- what triggered it
- who triggered it
- when it happened
- what systems contributed

Always-audit actions
--------------------
- refunds
- role changes
- exports
- payroll runs
- schedule edits
- vendor contract edits
- feature flags

Approval pattern
----------------
1) Request created
2) Approval decision logged
3) Action executed logged
4) Admin notified (severity-based)
