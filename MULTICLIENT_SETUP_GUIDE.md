# Multiclient Authentication Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Auth Server
cd packages/auth-server
npm install --legacy-peer-deps

# Business Spine (if not already installed)
cd apps/business-spine
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

**Auth Server** (`packages/auth-server/.env`):
```env
PORT=4000
ISSUER=http://localhost:4000
JWT_SECRET=dev_secret_change_me_in_production
```

**Business Spine** (`apps/business-spine/.env.local`):
```env
NEXT_PUBLIC_AUTH_SERVER=http://localhost:4000
JWT_SECRET=dev_secret_change_me_in_production
ISSUER=http://localhost:4000
```

### 3. Start Services

**Terminal 1 - Auth Server:**
```bash
cd packages/auth-server
npm run dev
# Runs on http://localhost:4000
```

**Terminal 2 - Business Spine:**
```bash
cd apps/business-spine
npm run dev
# Runs on http://localhost:3000
```

## Architecture Overview

### Multiclient Authentication Flow

```
┌─────────────────┐
│  Client App     │
│  (business_spine│
│   mobile_app    │
│   admin_portal) │
└────────┬────────┘
         │
         │ 1. POST /token
         │ (email, password, client_id, scopes)
         ▼
┌─────────────────────────────────────┐
│  Auth Server (port 4000)            │
│  ┌─────────────────────────────────┐│
│  │ Token Generation                ││
│  │ - Verify credentials            ││
│  │ - Validate client_id            ││
│  │ - Check allowed_scopes          ││
│  │ - Create JWT with claims:       ││
│  │   * aud (client_id)             ││
│  │   * scp (scopes)                ││
│  │   * risk (ok/restricted/banned) ││
│  │   * entitlements                ││
│  └─────────────────────────────────┘│
└────────┬────────────────────────────┘
         │
         │ 2. Return JWT Token
         ▼
┌─────────────────┐
│  Client App     │
│  (stores token) │
└────────┬────────┘
         │
         │ 3. GET /api/admin/users
         │ Header: Authorization: Bearer <token>
         ▼
┌──────────────────────────────────────┐
│  Business Spine (port 3000)          │
│  ┌──────────────────────────────────┐│
│  │ RBAC Middleware                  ││
│  │ 1. Extract token from header     ││
│  │ 2. Try multiclient verification: ││
│  │    - verifyHs256Bearer()         ││
│  │    - requireAudience()           ││
│  │    - requireScopes()             ││
│  │    - denyIfBanned()              ││
│  │ 3. Fallback to legacy if needed  ││
│  │ 4. Fetch user from database      ││
│  │ 5. Check RBAC permission         ││
│  │ 6. Log to audit trail            ││
│  │ 7. Add context headers           ││
│  └──────────────────────────────────┘│
└────────┬─────────────────────────────┘
         │
         │ 4. Response with context headers
         ▼
┌─────────────────┐
│  Client App     │
│  (receives data)│
└─────────────────┘
```

## Configuration Files

### Clients Configuration
**File:** `packages/auth-server/config/clients.json`

Defines which applications can authenticate and what scopes they can request:

```json
{
  "clients": [
    {
      "client_id": "business_spine",
      "allowed_scopes": ["users:read", "bookings:create", ...],
      "default_scopes": ["bookings:read"]
    },
    {
      "client_id": "mobile_app",
      "allowed_scopes": ["profile:read", "bookings:read", ...],
      "default_scopes": ["profile:read"]
    }
  ]
}
```

### Users Configuration
**File:** `packages/auth-server/config/users.json`

Defines demo users with their roles and scopes:

```json
{
  "users": [
    {
      "id": "u1",
      "email": "admin@demo.com",
      "password": "password",
      "role": "admin",
      "scopes": ["users:read", "admin:update", ...],
      "risk": "ok",
      "entitlements": {"premium": true, "admin_access": true}
    }
  ]
}
```

## Integration Points

### 1. Auth Package (`packages/auth/src/index.ts`)
- ✅ `JwtPayload` type extended with multiclient fields
- ✅ `SpineJwtClaims` type for multiclient tokens
- ✅ `verifyHs256Bearer()` function for token verification
- ✅ `requireAudience()`, `requireScopes()`, `denyIfBanned()` validators
- ✅ Backward compatible with legacy tokens

### 2. RBAC Middleware (`apps/business-spine/src/lib/rbac-middleware.ts`)
- ✅ `rbacMiddleware()` supports multiclient config
- ✅ Tries multiclient verification first
- ✅ Falls back to legacy verification
- ✅ Enhanced audit logging with client context
- ✅ `withRBAC()` and `withMulticlientRBAC()` helpers

### 3. API Routes
All protected routes use the `withRBAC()` wrapper:

```typescript
export const GET = withRBAC(getUsers, { resource: 'users', action: 'read' });
```

Optional multiclient config:
```typescript
export const GET = withMulticlientRBAC(
  getUsers,
  { resource: 'users', action: 'read' },
  'business_spine',
  ['users:read']
);
```

### 4. Frontend Hooks (`apps/business-spine/src/hooks/useAuth.ts`)
- ✅ `AuthProvider` for client-side auth state
- ✅ `useAuth()` hook for accessing auth context
- ✅ `hasPermission()` for scope checking
- ✅ `withRole()` and `withPermission()` HOCs

## Scope Format

Scopes follow the `resource:action` pattern:

**Resource Types:**
- `users` - User management
- `bookings` - Booking management
- `payments` - Payment processing
- `analytics` - Analytics access
- `reports` - Report generation
- `admin` - Admin functions
- `profile` - User profile
- `schedule` - Schedule management
- `launch-gate` - Launch gate control
- `kill-switches` - Kill switch management

**Action Types:**
- `read` - Read/view access
- `create` - Create new items
- `update` - Update existing items
- `delete` - Delete items
- `refund` - Refund payments
- `approve` - Approve actions

**Examples:**
- `users:read` - Read user information
- `bookings:create` - Create new bookings
- `payments:refund` - Process refunds
- `admin:update` - Update admin settings

## Role-Based Access Control

Roles are still used for high-level access control:

| Role | Permissions | Use Case |
|------|-------------|----------|
| `owner` | All permissions (*) | System owner |
| `admin` | User management, system config, analytics | Administrators |
| `manager` | Team management, reports, scheduling | Team leads |
| `staff` | Bookings, profile, schedule | Staff members |
| `readonly` | Reports, analytics (read-only) | Analysts |
| `client` | Profile, bookings (limited) | End users |

## Security Considerations

### 1. JWT Secret
- Use strong, random secret in production
- Keep secret synchronized between auth server and all services
- Rotate secrets periodically

### 2. Token Expiration
- Default: 24 hours
- Shorter for sensitive operations
- Implement refresh token flow for long-lived sessions

### 3. Risk States
- `ok` - Normal user, full access
- `restricted` - Limited access (e.g., suspicious activity)
- `banned` - No access, request rejected

### 4. Scope Validation
- Client must have scope in `allowed_scopes`
- User must have scope in `scopes` array
- Requested scopes must be subset of both

### 5. Audit Logging
All access attempts are logged with:
- User ID and role
- Client ID and scopes
- Risk state
- Request path and method
- Timestamp

## Troubleshooting

### Issue: "Auth server not responding"
**Solution:**
1. Check auth server is running on port 4000
2. Verify `JWT_SECRET` is set
3. Check `config/clients.json` and `config/users.json` exist
4. Review auth server logs for errors

### Issue: "Token verification failed"
**Solution:**
1. Verify JWT_SECRET matches between services
2. Check token hasn't expired
3. Verify issuer matches (default: http://localhost:4000)
4. Ensure token format is correct (Bearer <token>)

### Issue: "Insufficient permissions"
**Solution:**
1. Check client has scope in `allowed_scopes`
2. Verify user has scope in `scopes` array
3. Check RBAC role has required permission
4. Review audit logs for details

### Issue: "Wrong audience"
**Solution:**
1. Verify client_id matches in token and middleware config
2. Check token was issued for correct client
3. Ensure client_id is in `clients.json`

## Next Steps

1. **Test the integration** - Follow MULTICLIENT_INTEGRATION_TEST.md
2. **Deploy to production** - Use RS256 instead of HS256
3. **Implement refresh tokens** - For long-lived sessions
4. **Add more clients** - Configure additional applications
5. **Monitor and audit** - Review logs regularly

## Support

For issues or questions:
1. Check MULTICLIENT_INTEGRATION_TEST.md for test scenarios
2. Review audit logs in database
3. Check auth server logs for token generation issues
4. Verify configuration files are valid JSON
