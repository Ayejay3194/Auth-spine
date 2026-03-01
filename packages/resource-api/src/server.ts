import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { randomUUID } from 'crypto'
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

const UPLOAD_MAX_SIZE_BYTES = Number(process.env.UPLOAD_MAX_SIZE_BYTES ?? 10 * 1024 * 1024) // 10 MB
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/json': '.json'
}
const ALLOWED_MIME_TYPES = new Set(Object.keys(MIME_TO_EXT))

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`))
    }
  }
})

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

app.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.message?.startsWith('Unsupported file type')) {
        return res.status(415).json({ ok: false, error: 'unsupported_media_type', details: err.message })
      }
      if ((err as any).code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ ok: false, error: 'file_too_large', maxBytes: UPLOAD_MAX_SIZE_BYTES })
      }
      return next(err)
    }
    next()
  })
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'no_file_provided' })
  }

  try {
    const c = await verifyBearer(req.header('authorization'), AUTH_ISSUER, {
      alg: JWT_ALG,
      secret: JWT_SECRET,
      publicKey: JWT_PUBLIC_KEY
    })
    requireAudience(REQUIRED_AUD)(c)
    denyIfBanned()(c)
    requireScopes(REQUIRED_SCOPES)(c)

    const fileId = randomUUID()
    // Derive extension from validated MIME type, not user-supplied filename
    const ext = MIME_TO_EXT[req.file.mimetype] ?? ''

    res.json({
      ok: true,
      file: {
        id: fileId,
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        ext,
        uploadedBy: c.sub
      }
    })
  } catch (e: any) {
    if (e.message === 'missing_bearer' || e.message === 'missing_public_key') {
      return res.status(401).json({ ok: false, error: 'unauthorized' })
    }
    res.status(403).json({ ok: false, error: String(e.message ?? e) })
  }
})

app.listen(PORT, () => console.log('resource-api on', `http://localhost:${PORT}`, 'issuer', AUTH_ISSUER))
