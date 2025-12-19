import { SignJWT } from 'jose'
import { createSecretKey } from 'crypto'

export async function issueAccessToken(opts: {
  issuer: string
  secret: string
  userId: string
  audience: string
  scopes: string[]
  risk: 'ok'|'restricted'|'banned'
  entitlements: Record<string, boolean>
  ttlSeconds?: number
}) {
  const ttl = opts.ttlSeconds ?? 60 * 30
  const now = Math.floor(Date.now() / 1000)
  const key = createSecretKey(Buffer.from(opts.secret, 'utf-8'))
  return new SignJWT({ aud: opts.audience, scp: opts.scopes, risk: opts.risk, entitlements: opts.entitlements })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(opts.issuer)
    .setSubject(opts.userId)
    .setIssuedAt(now)
    .setExpirationTime(now + ttl)
    .sign(key)
}
