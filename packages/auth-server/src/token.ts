import { SignJWT } from 'jose'
import { createSecretKey, createPrivateKey, KeyObject } from 'crypto'

export type JwtAlgorithm = 'HS256' | 'RS256'

export type TokenKey = {
  alg: JwtAlgorithm
  key: KeyObject
  keyId?: string
}

export function loadSigningKey(opts: {
  alg: JwtAlgorithm
  secret?: string
  privateKey?: string
  keyId?: string
}): TokenKey {
  if (opts.alg === 'HS256') {
    if (!opts.secret) throw new Error('JWT_SECRET is required for HS256')
    return { alg: 'HS256', key: createSecretKey(Buffer.from(opts.secret, 'utf-8')), keyId: opts.keyId }
  }

  if (!opts.privateKey) throw new Error('JWT_PRIVATE_KEY is required for RS256')
  return { alg: 'RS256', key: createPrivateKey(opts.privateKey), keyId: opts.keyId }
}

export async function issueAccessToken(opts: {
  issuer: string
  signingKey: TokenKey
  userId: string
  audience: string
  scopes: string[]
  risk: 'ok' | 'restricted' | 'banned'
  entitlements: Record<string, boolean>
  sessionId?: string
  ttlSeconds?: number
}) {
  const ttl = opts.ttlSeconds ?? 60 * 30
  const now = Math.floor(Date.now() / 1000)
  const jwt = new SignJWT({
    aud: opts.audience,
    scp: opts.scopes,
    risk: opts.risk,
    entitlements: opts.entitlements,
    sid: opts.sessionId
  })
    .setProtectedHeader({ alg: opts.signingKey.alg, typ: 'JWT', kid: opts.signingKey.keyId })
    .setIssuer(opts.issuer)
    .setSubject(opts.userId)
    .setIssuedAt(now)
    .setExpirationTime(now + ttl)

  return jwt.sign(opts.signingKey.key)
}
