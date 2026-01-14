import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import { verifyBearer, requireAudience, requireScopes, denyIfBanned } from '@spine/shared/auth'

const PORT = Number(process.env.PORT ?? 4100)
const AUTH_ISSUER = process.env.AUTH_ISSUER?.trim()
if (!AUTH_ISSUER) {
  console.error('ERROR: AUTH_ISSUER environment variable is required')
  process.exit(1)
}
try {
  new URL(AUTH_ISSUER)
} catch {
  console.error('ERROR: AUTH_ISSUER must be a valid URL')
  process.exit(1)
}

const JWT_SECRET = process.env.JWT_SECRET?.trim()
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required')
  process.exit(1)
}
const JWT_ALG = (process.env.JWT_ALG as 'HS256' | 'RS256') ?? 'HS256'
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY
const REQUIRED_AUD = String(process.env.REQUIRED_AUD ?? 'app_one')
const REQUIRED_SCOPES = String(process.env.REQUIRED_SCOPES ?? 'read').split(',').map(s=>s.trim()).filter(Boolean)

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok:true, issuer: AUTH_ISSUER, required: { aud: REQUIRED_AUD, scopes: REQUIRED_SCOPES } }))

app.get('/me', async (req, res) => {
  try {
    const c = await verifyBearer(req.header('authorization'), AUTH_ISSUER, {
      alg: JWT_ALG,
      secret: JWT_SECRET,
      publicKey: JWT_PUBLIC_KEY
    })
    requireAudience(REQUIRED_AUD)(c)
    denyIfBanned()(c)
    requireScopes(REQUIRED_SCOPES)(c)
    res.json({ ok:true, sub:c.sub, aud:c.aud, scp:c.scp, risk:c.risk, entitlements:c.entitlements })
  } catch (e:any) {
    res.status(401).json({ ok:false, error: String(e.message ?? e) })
  }
})

app.post('/resource', async (req, res) => {
  const body = z.object({ name: z.string().min(1) }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: 'bad_request' })
  try {
    const c = await verifyBearer(req.header('authorization'), AUTH_ISSUER, {
      alg: JWT_ALG,
      secret: JWT_SECRET,
      publicKey: JWT_PUBLIC_KEY
    })
    requireAudience(REQUIRED_AUD)(c)
    denyIfBanned()(c)
    requireScopes(REQUIRED_SCOPES)(c)
    res.json({ ok:true, created: { id: 'r_' + Math.random().toString(16).slice(2), name: body.data.name }, by: c.sub })
  } catch (e:any) {
    res.status(403).json({ ok:false, error: String(e.message ?? e) })
  }
})

app.listen(PORT, () => console.log('resource-api on', `http://localhost:${PORT}`, 'issuer', AUTH_ISSUER))
