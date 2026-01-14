# Multiclient Authentication Integration Test

## Overview
This document provides a comprehensive guide to test the multiclient authentication system integration with the Auth-Spine RBAC system.

## Architecture

### Components
1. **Auth Server** (`packages/auth-server`) - Issues JWT tokens with multiclient claims
2. **Shared Package** (`packages/shared`) - Token verification + shared database utilities
3. **RBAC Middleware** (`apps/business-spine/src/lib/rbac-middleware.ts`) - Enforces permissions
4. **Business Spine** (`apps/business-spine`) - Main application using RBAC

### Token Flow
```
Client App → Auth Server → JWT Token (with aud, scp, risk) → RBAC Middleware → Protected Resource
```

## Test Scenarios

### 1. Auth Server Health Check
**Endpoint:** `GET http://localhost:4000/health`

**Expected Response:**
```json
{
  "ok": true,
  "issuer": "http://localhost:4000",
  "clients": ["business_spine", "mobile_app", "admin_portal", "api_service"]
}
```

### 2. Admin User Token Request
**Endpoint:** `POST http://localhost:4000/token`

**Request Body:**
```json
{
  "email": "admin@demo.com",
  "password": "password",
  "client_id": "business_spine",
  "requested_scopes": ["users:read", "admin:update"]
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Token Claims (decoded):**
```json
{
  "iss": "http://localhost:4000",
  "sub": "u1",
  "aud": "business_spine",
  "scp": ["users:read", "admin:update"],
  "risk": "ok",
  "entitlements": {
    "premium": true,
    "admin_access": true
  }
}
```

### 3. Manager User Token Request
**Endpoint:** `POST http://localhost:4000/token`

**Request Body:**
```json
{
  "email": "manager@demo.com",
  "password": "password",
  "client_id": "mobile_app",
  "requested_scopes": ["bookings:read"]
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 4. RBAC Middleware Verification
**Test:** Protected API endpoint with multiclient token

**Endpoint:** `GET http://localhost:3000/api/admin/users`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Expected Behavior:**
1. ✅ Token is verified using `verifyHs256Bearer()`
2. ✅ Audience (aud) is validated against "business_spine"
3. ✅ Scopes are checked for "users:read"
4. ✅ Risk state is validated (not "banned")
5. ✅ User role is fetched from database
6. ✅ RBAC permission check passes (admin role has users:read)
7. ✅ Request headers are enriched with user context
8. ✅ Response is returned with 200 status

**Response Headers:**
```
x-user-id: u1
x-user-role: admin
x-user-email: admin@demo.com
x-client-id: business_spine
x-scopes: users:read,admin:update
x-risk-state: ok
```

### 5. Scope Validation Test
**Test:** Request without required scope

**Endpoint:** `POST http://localhost:3000/api/admin/users`

**Headers:**
```
Authorization: Bearer <manager_token_without_users:create>
```

**Expected Behavior:**
1. ❌ Token verification succeeds
2. ❌ Audience validation passes
3. ❌ Scope validation fails (missing "users:create")
4. ❌ Request is rejected with 403 Forbidden

**Expected Response:**
```json
{
  "error": "Insufficient permissions"
}
```

### 6. Risk State Validation Test
**Test:** Banned user token

**Setup:** Create a user with `"risk": "banned"`

**Expected Behavior:**
1. ❌ Token verification succeeds
2. ❌ Audience validation passes
3. ❌ Risk state check fails (user is banned)
4. ❌ Request is rejected with 403 Forbidden

### 7. Backward Compatibility Test
**Test:** Legacy JWT token (without multiclient claims)

**Endpoint:** `GET http://localhost:3000/api/admin/users`

**Headers:**
```
Authorization: Bearer <legacy_jwt_token>
```

**Expected Behavior:**
1. ✅ Multiclient verification fails (no aud claim)
2. ✅ Falls back to legacy `verifyToken()`
3. ✅ User role is fetched from database
4. ✅ RBAC permission check passes
5. ✅ Request succeeds with 200 status

## Integration Checklist

### Auth Server Setup
- [ ] Auth server dependencies installed (`npm install --legacy-peer-deps`)
- [ ] Auth server can start without errors
- [ ] Health endpoint responds correctly
- [ ] Clients are loaded from `config/clients.json`
- [ ] Users are loaded from `config/users.json`

### Token Generation
- [ ] Admin user can request token
- [ ] Manager user can request token
- [ ] Staff user can request token
- [ ] Client user can request token
- [ ] Tokens contain correct claims (aud, scp, risk, entitlements)
- [ ] Tokens are valid JWT format

### RBAC Middleware Integration
- [ ] Middleware imports multiclient functions correctly
- [ ] `verifyHs256Bearer()` is called for multiclient tokens
- [ ] `requireAudience()` validates client_id
- [ ] `requireScopes()` validates required scopes
- [ ] `denyIfBanned()` checks risk state
- [ ] Fallback to legacy verification works
- [ ] Audit logging includes multiclient context

### Scope-Based Authorization
- [ ] Admin can access users:read
- [ ] Admin can access admin:update
- [ ] Manager cannot access users:create
- [ ] Staff cannot access admin:read
- [ ] Client cannot access users:read

### Risk State Management
- [ ] "ok" users are allowed
- [ ] "restricted" users are allowed (with warnings)
- [ ] "banned" users are rejected

### Backward Compatibility
- [ ] Legacy tokens still work
- [ ] Legacy tokens fall back to role-based RBAC
- [ ] No breaking changes to existing API

## Running the Tests

### Start Auth Server
```bash
cd packages/auth-server
npm install --legacy-peer-deps
npm run dev
# Server runs on http://localhost:4000
```

### Start Business Spine
```bash
cd apps/business-spine
npm run dev
# App runs on http://localhost:3000
```

### Run Integration Tests
```bash
# Test 1: Health check
curl http://localhost:4000/health

# Test 2: Admin token
curl -X POST http://localhost:4000/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "password",
    "client_id": "business_spine",
    "requested_scopes": ["users:read", "admin:update"]
  }'

# Test 3: Protected endpoint with token
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/admin/users
```

## Troubleshooting

### Auth Server Won't Start
- Check Node.js version (requires 16+)
- Verify `config/clients.json` and `config/users.json` exist
- Check port 4000 is not in use
- Review `.env` file for JWT_SECRET

### Token Verification Fails
- Verify JWT_SECRET matches between auth server and RBAC middleware
- Check token expiration time
- Verify issuer matches (default: http://localhost:4000)

### Scope Validation Fails
- Check client has scope in `allowed_scopes`
- Verify user has scope in `scopes` array
- Check requested_scopes are subset of allowed_scopes

### RBAC Middleware Not Working
- Verify middleware is imported correctly
- Check user exists in database
- Verify role is set on user
- Check permission matrix includes required permission

## Success Criteria

✅ All test scenarios pass
✅ No breaking changes to existing API
✅ Backward compatibility maintained
✅ Audit logging includes multiclient context
✅ Performance is acceptable (< 100ms per request)
✅ Error messages are clear and helpful
