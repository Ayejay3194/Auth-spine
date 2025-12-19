# CSRF
Flow:
1) GET /api/csrf -> sets HttpOnly cookie `csrf` and returns token
2) Send state-changing requests with header: x-csrf-token: <token>

Because this is an API-first app, CSRF matters mainly for cookie-auth sessions.
If you run pure Bearer JWT + no cookies, CSRF is mostly irrelevant.
