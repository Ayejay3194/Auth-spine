import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import { loadClients, loadUsers } from './config'
import { issueAccessToken } from './token'

const PORT = Number(process.env.PORT ?? 4000)
const ISSUER = String(process.env.ISSUER ?? `http://localhost:${PORT}`)
const JWT_SECRET = String(process.env.JWT_SECRET ?? 'dev_secret_change_me')

const clients = loadClients()
const users = loadUsers()

const clientById = new Map(clients.map(c => [c.client_id, c]))
const userByEmail = new Map(users.map(u => [u.email.toLowerCase(), u]))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok:true, issuer: ISSUER, clients: clients.map(c=>c.client_id) }))

const tokenReq = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  client_id: z.string(),
  requested_scopes: z.array(z.string()).optional()
})

app.post('/token', async (req, res) => {
  const parsed = tokenReq.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error:'bad_request', details: parsed.error.flatten() })

  const { email, password, client_id, requested_scopes } = parsed.data
  const user = userByEmail.get(email.toLowerCase())
  if (!user || user.password !== password) return res.status(401).json({ error:'invalid_credentials' })

  const client = clientById.get(client_id)
  if (!client) return res.status(400).json({ error:'unknown_client' })

  const reqScopes = requested_scopes ?? client.default_scopes ?? user.scopes
  const allowed = new Set(client.allowed_scopes)
  const userSet = new Set(user.scopes)
  const scopes = Array.from(new Set(reqScopes)).filter(s => allowed.has(s) && userSet.has(s))
  if (scopes.length === 0) return res.status(403).json({ error:'no_scopes_for_client' })

  const access_token = await issueAccessToken({
    issuer: ISSUER,
    secret: JWT_SECRET,
    userId: user.id,
    audience: client_id,
    scopes,
    risk: (user.risk ?? 'ok'),
    entitlements: (user.entitlements ?? {})
  })

  res.json({ token_type:'Bearer', access_token, expires_in: 1800, aud: client_id, scp: scopes })
})

app.listen(PORT, () => console.log('auth-server on', ISSUER))
