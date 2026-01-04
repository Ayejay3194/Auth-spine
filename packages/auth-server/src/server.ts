import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { jwtVerify } from 'jose'
import { createPublicKey, randomBytes, timingSafeEqual } from 'crypto'
import rateLimit from 'express-rate-limit'
import csrf from 'csurf'
import helmet from 'helmet'
import { loadClients, loadUsers, UserConfig } from './config'
import { issueAccessToken, loadSigningKey, JwtAlgorithm, TokenKey } from './token'
import { sessionStore } from './session-store';
import { SpineJwtClaims, Session, RefreshToken, AuditEvent, AuthError, validateScopes, AllowedScope } from './types'

const PORT = Number(process.env.PORT ?? 4000)
const ISSUER = process.env.ISSUER?.trim()
if (!ISSUER) {
  console.error('ERROR: ISSUER environment variable is required')
  process.exit(1)
}
try {
  new URL(ISSUER)
} catch {
  console.error('ERROR: ISSUER must be a valid URL')
  process.exit(1)
}
const JWT_ALG = (process.env.JWT_ALG ?? 'HS256') as JwtAlgorithm
const JWT_KEY_ID = process.env.JWT_KEY_ID ?? 'auth-spine-key'
const JWT_SECRET = process.env.JWT_SECRET
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY
const ACCESS_TTL_SECONDS = Number(process.env.ACCESS_TTL_SECONDS ?? 60 * 30)
const REFRESH_TTL_SECONDS = Number(process.env.REFRESH_TTL_SECONDS ?? 60 * 60 * 24 * 7)

if (JWT_ALG === 'HS256' && !JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required for HS256')
  process.exit(1)
}

if (JWT_ALG === 'RS256' && (!JWT_PRIVATE_KEY || !JWT_PUBLIC_KEY)) {
  console.error('ERROR: JWT_PRIVATE_KEY and JWT_PUBLIC_KEY are required for RS256')
  process.exit(1)
}

const signingKey: TokenKey = loadSigningKey({
  alg: JWT_ALG,
  secret: JWT_SECRET,
  privateKey: JWT_PRIVATE_KEY,
  keyId: JWT_KEY_ID
})

const verifyKey = JWT_ALG === 'RS256' && JWT_PUBLIC_KEY
  ? createPublicKey(JWT_PUBLIC_KEY)
  : signingKey.key

const clients = loadClients()
const users = loadUsers()

const clientById = new Map(clients.map(c => [c.client_id, c]))
const userByEmail = new Map(users.map(u => [u.email.toLowerCase(), u]))
const userById = new Map(users.map(u => [u.id, u]))

// Replaced in-memory storage with persistent session store
// const sessions = new Map<string, Session>()
// const refreshTokens = new Map<string, RefreshToken>()
const permissionStreams = new Set<express.Response>()
const auditEvents: AuditEvent[] = []

// Stream cleanup to prevent memory leaks
function cleanupStream(res: express.Response) {
  res.on('close', () => permissionStreams.delete(res))
  res.on('error', () => permissionStreams.delete(res))
}

function recordAudit(eventType: string, data?: { userId?: string; clientId?: string; metadata?: Record<string, unknown> }): void {
  const event: AuditEvent = {
    id: randomBytes(12).toString('hex'),
    eventType,
    userId: data?.userId,
    clientId: data?.clientId,
    createdAt: Date.now(),
    metadata: data?.metadata
  }
  auditEvents.push(event)
  // TODO: Persist to database instead of keeping in memory
  if (auditEvents.length > 1000) auditEvents.shift()
}

function createSession(user: UserConfig | null, clientId: string, scopes: AllowedScope[]): Session {
  if (!user) {
    throw new AuthError('User is required to create session', 'INVALID_USER', 400)
  }
  
  // Use persistent session store instead of in-memory Map
  return sessionStore.createSession({
    userId: user.id,
    clientId,
    scopes,
    risk: user.risk ?? 'ok',
    entitlements: user.entitlements ?? {}
  })
}

function createRefreshToken(sessionId: string, userId: string): RefreshToken {
  // Use persistent session store instead of in-memory Map
  return sessionStore.createRefreshToken({
    sessionId,
    userId
  })
}

async function revokeSession(sessionId: string): Promise<void> {
  // Use persistent session store for atomic operations
  await Promise.all([
    sessionStore.deleteSession(sessionId),
    sessionStore.deleteRefreshTokensForSession(sessionId)
  ])
}

async function verifyBearerToken(authorization: string | undefined): Promise<SpineJwtClaims> {
  if (!authorization?.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Bearer token', 'MISSING_BEARER', 401)
  }
  const token = authorization.slice('Bearer '.length)
  try {
    const { payload } = await jwtVerify(token, verifyKey, { issuer: ISSUER, algorithms: [JWT_ALG] })
    return payload as SpineJwtClaims
  } catch (error) {
    throw new AuthError('Invalid or expired token', 'INVALID_TOKEN', 401)
  }
}

function extractScopes(payload: SpineJwtClaims): AllowedScope[] {
  return validateScopes(payload?.scp || [])
}

async function requireScopeOrRespond(
  req: express.Request,
  res: express.Response,
  requiredScope: string
) {
  try {
    const payload = await verifyBearerToken(req.headers.authorization)
    const scopes = extractScopes(payload)
    if (!scopes.includes(requiredScope)) {
      res.status(403).json({ error: 'insufficient_scope', required: requiredScope })
      return null
    }
    return payload
  } catch (error) {
    res.status(401).json({ error: 'invalid_token' })
    return null
  }
}

type AuthResult = { user: UserConfig } | { error: string; status: number }

async function authenticateUser(opts: {
  email: string
  password: string
  clientId: string
  mfaCode?: string
  recordAuditEvents: boolean
}): Promise<AuthResult> {
  const user = userByEmail.get(opts.email.toLowerCase())
  if (!user) {
    if (opts.recordAuditEvents) {
      recordAudit('AUTH_FAILED', { clientId: opts.clientId, metadata: { email: opts.email } })
    }
    return { error: 'invalid_credentials', status: 401 }
  }

  const passwordMatch = await bcrypt.compare(opts.password, user.password)
  if (!passwordMatch) {
    if (opts.recordAuditEvents) {
      recordAudit('AUTH_FAILED', { userId: user.id, clientId: opts.clientId })
    }
    return { error: 'invalid_credentials', status: 401 }
  }

  if (user.mfa?.enabled) {
    if (!opts.mfaCode) {
      if (opts.recordAuditEvents) {
        recordAudit('MFA_REQUIRED', { userId: user.id, clientId: opts.clientId })
      }
      return { error: 'mfa_required', status: 401 }
    }
    if (opts.mfaCode !== user.mfa.code) {
      if (opts.recordAuditEvents) {
        recordAudit('MFA_FAILED', { userId: user.id, clientId: opts.clientId })
      }
      return { error: 'invalid_mfa_code', status: 401 }
    }
  }

  return { user }
}

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'] }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true, issuer: ISSUER, clients: clients.map(c => c.client_id) }))

app.get('/.well-known/openid-configuration', (_req, res) => {
  res.json({
    issuer: ISSUER,
    token_endpoint: `${ISSUER}/oauth/token`,
    userinfo_endpoint: `${ISSUER}/oauth/userinfo`,
    jwks_uri: `${ISSUER}/oauth/jwks`,
    scopes_supported: ['openid', 'profile', 'email'],
    response_types_supported: ['token'],
    grant_types_supported: ['password', 'refresh_token']
  })
})

app.get('/oauth/jwks', async (_req, res) => {
  if (JWT_ALG !== 'RS256' || !JWT_PUBLIC_KEY) {
    return res.json({ keys: [] })
  }
  const jwk = await exportJWK(createPublicKey(JWT_PUBLIC_KEY))
  res.json({ keys: [{ ...jwk, kid: JWT_KEY_ID, alg: 'RS256', use: 'sig' }] })
})

const tokenReq = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
  client_id: z.string(),
  requested_scopes: z.array(z.string()).optional(),
  mfa_code: z.string().optional()
})

const refreshReq = z.object({
  refresh_token: z.string().min(10),
  client_id: z.string(),
  requested_scopes: z.array(z.string()).optional()
})

const revokeReq = z.object({
  session_id: z.string().optional(),
  refresh_token: z.string().optional()
})

const permissionUpdateReq = z.object({
  user_id: z.string(),
  scopes: z.array(z.string()).optional(),
  risk: z.enum(['ok', 'restricted', 'banned']).optional(),
  entitlements: z.record(z.boolean()).optional()
})

function resolveScopes(user: UserConfig, client: { allowed_scopes: string[]; default_scopes?: string[] }, requested?: string[]) {
  const reqScopes = requested ?? client.default_scopes ?? user.scopes
  const allowed = new Set(client.allowed_scopes)
  const userSet = new Set(user.scopes)
  const scopes = Array.from(new Set(reqScopes)).filter(s => allowed.has(s) && userSet.has(s))
  return scopes.length > 0 ? scopes : null
}

async function respondWithTokens(opts: {
  user: UserConfig
  clientId: string
  requestedScopes?: string[]
  res: express.Response
  auditEvent: string
}) {
  const client = clientById.get(opts.clientId)
  if (!client) return opts.res.status(400).json({ error: 'unknown_client' })

  const scopes = resolveScopes(opts.user, client, opts.requestedScopes)
  if (!scopes) return opts.res.status(403).json({ error: 'no_scopes_for_client' })

  const session = createSession(opts.user, opts.clientId, scopes)
  const refresh = createRefreshToken(session.id, opts.user.id)

  const access_token = await issueAccessToken({
    issuer: ISSUER,
    signingKey,
    userId: opts.user.id,
    audience: opts.clientId,
    scopes,
    risk: opts.user.risk ?? 'ok',
    entitlements: opts.user.entitlements ?? {},
    sessionId: session.id,
    ttlSeconds: ACCESS_TTL_SECONDS
  })

  recordAudit(opts.auditEvent, { userId: opts.user.id, clientId: opts.clientId })

  return opts.res.json({
    token_type: 'Bearer',
    access_token,
    refresh_token: refresh.id,
    expires_in: ACCESS_TTL_SECONDS,
    refresh_expires_in: REFRESH_TTL_SECONDS,
    aud: opts.clientId,
    scp: scopes,
    sid: session.id
  })
}

app.post('/token', async (req, res) => {
  const parsed = tokenReq.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() })

  const { email, password, client_id, requested_scopes, mfa_code } = parsed.data
  const authResult = await authenticateUser({
    email,
    password,
    clientId: client_id,
    mfaCode: mfa_code,
    recordAuditEvents: true
  })
  if ('error' in authResult) return res.status(authResult.status).json({ error: authResult.error })

  return respondWithTokens({
    user: authResult.user,
    clientId: client_id,
    requestedScopes: requested_scopes,
    res,
    auditEvent: 'AUTH_SUCCESS'
  })
})

app.post('/token/refresh', async (req, res) => {
  const parsed = refreshReq.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() })

  const { refresh_token, client_id, requested_scopes } = parsed.data
  const client = clientById.get(client_id)
  if (!client) return res.status(400).json({ error: 'unknown_client' })

  const refresh = refreshTokens.get(refresh_token)
  if (!refresh || refresh.expiresAt < Date.now()) {
    if (refresh) refreshTokens.delete(refresh_token)
    recordAudit('REFRESH_FAILED', { clientId: client_id })
    return res.status(401).json({ error: 'invalid_refresh_token' })
  }

  const session = sessions.get(refresh.sessionId)
  const user = session ? userById.get(session.userId) : null
  if (!session || !user || session.clientId !== client_id || session.expiresAt < Date.now()) {
    recordAudit('REFRESH_FAILED', { clientId: client_id })
    return res.status(401).json({ error: 'invalid_session' })
  }

  const scopes = resolveScopes(user, client, requested_scopes)
  if (!scopes) return res.status(403).json({ error: 'no_scopes_for_client' })

  session.scopes = scopes
  session.risk = user.risk ?? 'ok'
  session.entitlements = user.entitlements ?? {}
  session.expiresAt = Date.now() + REFRESH_TTL_SECONDS * 1000

  const newRefresh = createRefreshToken(session.id, user.id)
  refreshTokens.delete(refresh_token)

  const access_token = await issueAccessToken({
    issuer: ISSUER,
    signingKey,
    userId: user.id,
    audience: client_id,
    scopes,
    risk: user.risk ?? 'ok',
    entitlements: user.entitlements ?? {},
    sessionId: session.id,
    ttlSeconds: ACCESS_TTL_SECONDS
  })

  recordAudit('REFRESH_SUCCESS', { userId: user.id, clientId: client_id })

  res.json({
    token_type: 'Bearer',
    access_token,
    refresh_token: newRefresh.id,
    expires_in: ACCESS_TTL_SECONDS,
    refresh_expires_in: REFRESH_TTL_SECONDS,
    aud: client_id,
    scp: scopes,
    sid: session.id
  })
})

app.post('/session/revoke', async (req, res) => {
  const payload = await requireScopeOrRespond(req, res, 'admin:update')
  if (!payload) return

  const parsed = revokeReq.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() })

  const { session_id, refresh_token } = parsed.data
  let sessionId = session_id
  if (!sessionId && refresh_token) {
    const refresh = refreshTokens.get(refresh_token)
    sessionId = refresh?.sessionId
  }

  if (!sessionId) return res.status(400).json({ error: 'missing_session' })
  revokeSession(sessionId)
  recordAudit('SESSION_REVOKED', { metadata: { sessionId, actor: payload.sub } })
  return res.json({ ok: true })
})

app.get('/sessions', async (req, res) => {
  const payload = await requireScopeOrRespond(req, res, 'admin:read')
  if (!payload) return
  res.json({ sessions: Array.from(sessions.values()) })
})

app.get('/permissions/stream', async (req, res) => {
  const payload = await requireScopeOrRespond(req, res, 'admin:read')
  if (!payload) return
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()
  res.write('event: ready\n')
  res.write('data: {"ok":true}\n\n')

  permissionStreams.add(res)

  req.on('close', () => {
    permissionStreams.delete(res)
  })
})

app.post('/permissions/update', async (req, res) => {
  const payload = await requireScopeOrRespond(req, res, 'admin:update')
  if (!payload) return

  const parsed = permissionUpdateReq.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() })

  const { user_id, scopes, risk, entitlements } = parsed.data
  const user = userById.get(user_id)
  if (!user) return res.status(404).json({ error: 'unknown_user' })

  if (scopes) user.scopes = scopes
  if (risk) user.risk = risk
  if (entitlements) user.entitlements = entitlements

  const payloadEvent = JSON.stringify({ user_id, scopes: user.scopes, risk: user.risk, entitlements: user.entitlements })
  for (const stream of permissionStreams) {
    stream.write('event: permission_update\n')
    stream.write(`data: ${payloadEvent}\n\n`)
  }

  recordAudit('PERMISSIONS_UPDATED', { userId: user_id, metadata: { actor: payload.sub } })

  res.json({ ok: true, user })
})

app.get('/audit/summary', async (req, res) => {
  const payload = await requireScopeOrRespond(req, res, 'admin:read')
  if (!payload) return
  const counts = auditEvents.reduce<Record<string, number>>((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] ?? 0) + 1
    return acc
  }, {})

  res.json({
    total: auditEvents.length,
    counts,
    recent: auditEvents.slice(-20).reverse()
  })
})

app.post('/oauth/token', async (req, res) => {
  const grantType = req.body?.grant_type
  if (grantType === 'password') {
    const parsed = tokenReq.safeParse({
      email: req.body?.username,
      password: req.body?.password,
      client_id: req.body?.client_id,
      requested_scopes: req.body?.scope?.split(' ').filter(Boolean),
      mfa_code: req.body?.mfa_code
    })
    if (!parsed.success) return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() })

    const { email, password, client_id, requested_scopes, mfa_code } = parsed.data
    const authResult = await authenticateUser({
      email,
      password,
      clientId: client_id,
      mfaCode: mfa_code,
      recordAuditEvents: false
    })
    if ('error' in authResult) return res.status(authResult.status).json({ error: authResult.error })

    return respondWithTokens({
      user: authResult.user,
      clientId: client_id,
      requestedScopes: requested_scopes,
      res,
      auditEvent: 'OAUTH_PASSWORD_SUCCESS'
    })
  }

  if (grantType === 'refresh_token') {
    const parsed = refreshReq.safeParse({
      refresh_token: req.body?.refresh_token,
      client_id: req.body?.client_id,
      requested_scopes: req.body?.scope?.split(' ').filter(Boolean)
    })
    if (!parsed.success) return res.status(400).json({ error: 'bad_request', details: parsed.error.flatten() })

    const { refresh_token, client_id, requested_scopes } = parsed.data
    const client = clientById.get(client_id)
    if (!client) return res.status(400).json({ error: 'unknown_client' })

    const refresh = refreshTokens.get(refresh_token)
    if (!refresh || refresh.expiresAt < Date.now()) {
      if (refresh) refreshTokens.delete(refresh_token)
      recordAudit('REFRESH_FAILED', { clientId: client_id })
      return res.status(401).json({ error: 'invalid_refresh_token' })
    }

    const session = sessions.get(refresh.sessionId)
    const user = session ? userById.get(session.userId) : null
    if (!session || !user || session.clientId !== client_id || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: 'invalid_session' })
    }

    const scopes = resolveScopes(user, client, requested_scopes)
    if (!scopes) return res.status(403).json({ error: 'no_scopes_for_client' })

    session.scopes = scopes
    session.risk = user.risk ?? 'ok'
    session.entitlements = user.entitlements ?? {}
    session.expiresAt = Date.now() + REFRESH_TTL_SECONDS * 1000

    const newRefresh = createRefreshToken(session.id, user.id)
    refreshTokens.delete(refresh_token)

    const access_token = await issueAccessToken({
      issuer: ISSUER,
      signingKey,
      userId: user.id,
      audience: client_id,
      scopes,
      risk: user.risk ?? 'ok',
      entitlements: user.entitlements ?? {},
      sessionId: session.id,
      ttlSeconds: ACCESS_TTL_SECONDS
    })

    recordAudit('OAUTH_REFRESH_SUCCESS', { userId: user.id, clientId: client_id })

    return res.json({
      token_type: 'Bearer',
      access_token,
      refresh_token: newRefresh.id,
      expires_in: ACCESS_TTL_SECONDS,
      refresh_expires_in: REFRESH_TTL_SECONDS,
      aud: client_id,
      scp: scopes,
      sid: session.id
    })
  }

  return res.status(400).json({ error: 'unsupported_grant_type' })
})

app.get('/oauth/userinfo', async (req, res) => {
  try {
    const payload = await verifyBearerToken(req.headers.authorization)
    const user = userById.get(payload.sub as string)
    if (!user) return res.status(404).json({ error: 'unknown_user' })
    res.json({
      sub: user.id,
      email: user.email,
      role: (user as any).role,
      scopes: user.scopes,
      risk: user.risk,
      entitlements: user.entitlements
    })
  } catch (error: any) {
    res.status(401).json({ error: 'invalid_token', details: error?.message })
  }
})

app.listen(PORT, () => console.log('auth-server on', ISSUER))
