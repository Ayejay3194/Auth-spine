# Security Audit Verification Runbook

**Purpose**: Reproducible commands to verify security controls in Auth-Spine repository

**Date**: 2025-12-22  
**Status**: Ready for execution

---

## 1. Password Hashing Verification

### Search for insecure password patterns

```bash
# Search for the alleged fake hashing pattern
rg -n "hashed_\$\{password\}" -S .

# Search for common fake hashing stubs
rg -n "hashed_|hash\(\)\s*{.*return|return\s+\`hashed_|return\s+\"hashed_" -S .

# Search for dangerous raw password storage
rg -n "password\s*:\s*(body\.)?password\b|password\s*=\s*(body\.)?password\b" -S apps src .

# Find all password hash field references
rg -n "passwordHash|hashedPassword|password_hash|pwdHash|pwd_hash" -S apps src .
```

### Find actual hashing implementation

```bash
# Locate hashing functions
rg -n "function\s+hashPassword|export\s+async\s+function\s+hashPassword|argon2\.hash|bcrypt\.hash|scrypt|pbkdf2" -S apps src .

# Locate verification functions
rg -n "verifyPassword|argon2\.verify|bcrypt\.compare" -S apps src .

# Find password creation endpoints
rg -n "register|signup|createUser|admin/users|users/route\.ts" -S apps src .
```

### Get context for matches

```bash
# For any match, get 5 lines of context
rg -n "PATTERN_FROM_ABOVE" -S . -C 5
```

---

## 2. Authentication Implementation Verification

### Token extraction and validation

```bash
# Find cookie handling
rg -n "cookies|req\.cookies|Cookie|httpOnly|secure:\s*true|sameSite" -S apps src .

# Find JWT usage
rg -n "jsonwebtoken|jwt|HS256|RS256|sign\(|verify\(|JWT_SECRET" -S apps src .

# Find session validation
rg -n "verifySession|sessionToken|Session not found|prisma\..*session|session\.find|findSession" -S apps src .
```

### Examine specific files

```bash
# View authentication entry point
cat apps/business-spine/src/core/auth.ts

# View JWT implementation
cat apps/business-spine/src/auth/jwt.ts

# View session management
cat apps/business-spine/src/auth/session.ts

# View login endpoint
cat apps/business-spine/app/api/auth/login_password/route.ts
```

---

## 3. Authorization & RBAC Verification

### Locate middleware and route protection

```bash
# Find middleware implementation
rg -n "middleware\.ts|matcher|NextResponse|NextRequest|withRBAC|requireRole|authorize" -S apps src .

# Find protected route definitions
rg -n "protectedRoutes|PUBLIC_ROUTES|AUTH_ROUTES|ADMIN_ROUTES|requiresAuth|PROTECTED_ROUTES" -S apps src .

# Find RBAC implementation
rg -n "ROLE_HIERARCHY|ROLE_PERMISSIONS|hasPermission|checkRole" -S apps src .
```

### Examine specific files

```bash
# View middleware
cat apps/business-spine/middleware.ts

# View RBAC middleware
cat apps/business-spine/src/lib/rbac-middleware.ts

# View admin routes
cat apps/business-spine/app/api/admin/users/route.ts
```

---

## 4. SQL Injection Verification

### Check database query patterns

```bash
# Find Prisma usage
rg -n "prisma\.|@prisma/client" -S apps src .

# Find raw SQL queries (dangerous)
rg -n "\$queryRaw|\$executeRaw|\.raw\(|\.query\(" -S apps src .

# Find string concatenation in queries
rg -n "SELECT.*\+|INSERT.*\+|UPDATE.*\+|DELETE.*\+|WHERE.*\+" -S apps src .
```

---

## 5. XSS & Security Headers Verification

### Check security headers

```bash
# Find security header configuration
rg -n "Content-Security-Policy|X-Frame-Options|X-XSS-Protection|Strict-Transport-Security" -S apps src .

# Find unsafe DOM manipulation
rg -n "innerHTML|dangerouslySetInnerHTML|document\.write|eval\(" -S apps src .
```

### Examine middleware headers

```bash
# View security headers in middleware
rg -n "res\.headers\.set|response\.headers" -S apps/business-spine/middleware.ts -C 3
```

---

## 6. Rate Limiting Verification

### Check rate limiting implementation

```bash
# Find rate limiting code
rg -n "rate-limit|rateLimit|isRateLimited|recordFailedAttempt" -S apps src .

# View rate limiting implementation
cat apps/business-spine/src/security/rate-limit.ts
```

---

## Expected Outputs for Secure Implementation

### ✅ Password Hashing (Secure)
- Should find: `argon2.hash(password, ARGON2_OPTIONS)`
- Should NOT find: `return \`hashed_${password}\``
- Should NOT find: `password: body.password` in database writes

### ✅ Authentication (Secure)
- Should find: Cookie-only token extraction
- Should find: `jwt.verify(token, secret, { algorithms: ["HS256"] })`
- Should find: Database session validation after JWT verification

### ✅ Authorization (Secure)
- Should find: `withRBAC` wrapper on protected endpoints
- Should find: Role hierarchy definition
- Should find: Server-side permission checks

### ✅ SQL Injection (Prevented)
- Should find: Prisma ORM usage with object-based queries
- Should NOT find: `$queryRaw` with string concatenation
- Should NOT find: Raw SQL with user input

### ✅ Security Headers (Configured)
- Should find: CSP, X-Frame-Options, HSTS headers
- Should NOT find: `innerHTML` or `dangerouslySetInnerHTML`

---

## Execution Instructions

1. **Run searches from repository root**:
   ```bash
   cd /Users/autreyjenkinsjr./Documents/GitHub/Auth-spine
   ```

2. **Execute each command block** and save outputs

3. **For any matches**, get context:
   ```bash
   rg -n "PATTERN" -S . -C 5
   ```

4. **Examine specific files** mentioned in matches

5. **Document findings** with:
   - File path
   - Line numbers
   - Actual code excerpt
   - Security assessment

---

## Audit Report Template

Once verification is complete, findings should be documented as:

```json
{
  "finding_id": "VULN-XXX",
  "status": "CONFIRMED|NOT_DETECTED",
  "category": "password_management|authentication|authorization|sqli|xss",
  "location": {
    "file": "exact/path/to/file.ts",
    "lines": "L10-L42",
    "function": "functionName"
  },
  "evidence": {
    "code_excerpt": "actual code from file",
    "search_command": "rg command that found it",
    "context": "surrounding code"
  },
  "assessment": "Security evaluation based on evidence"
}
```

---

## Next Steps

1. Execute verification commands
2. Collect outputs and code excerpts
3. Generate evidence-based audit report
4. No findings should be claimed without direct code evidence
