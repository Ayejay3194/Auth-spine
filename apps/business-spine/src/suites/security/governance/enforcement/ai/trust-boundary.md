AI Trust Boundary Rules

INTERNAL ASSISTANT:
- Raw DB access allowed
- Mutation allowed
- Audit logging mandatory

EXTERNAL ASSISTANT:
- NO raw DB access
- DTO-only responses
- Mandatory sanitization
- Scoped APIs only
- Memory isolated per user

Violation = request blocked + alert.
