import { jwtVerify } from 'jose'
import { createPublicKey, createSecretKey } from 'crypto'
import type { SpineJwtClaims } from './types'

export type JwtAlgorithm = 'HS256' | 'RS256'

export async function verifyBearer(
  authorization: string | undefined,
  issuer: string,
  options: { alg?: JwtAlgorithm; secret?: string; publicKey?: string } = {}
): Promise<SpineJwtClaims> {
  if (!authorization || !authorization.startsWith('Bearer ')) throw new Error('missing_bearer')
  const token = authorization.slice('Bearer '.length)
  const alg = options.alg ?? (process.env.JWT_ALG as JwtAlgorithm) ?? 'HS256'
  const key = alg === 'HS256'
    ? createSecretKey(Buffer.from(options.secret ?? process.env.JWT_SECRET ?? 'dev_secret_change_me', 'utf-8'))
    : (() => {
        const publicKey = options.publicKey ?? process.env.JWT_PUBLIC_KEY
        if (!publicKey) throw new Error('missing_public_key')
        return createPublicKey(publicKey)
      })()
  const { payload } = await jwtVerify(token, key, { issuer, algorithms: [alg] })
  const p = payload as any
  return {
    iss: String(p.iss),
    sub: String(p.sub),
    aud: String(p.aud),
    scp: Array.isArray(p.scp) ? p.scp.map(String) : [],
    risk: (p.risk ?? 'ok'),
    entitlements: (p.entitlements ?? {}) as Record<string, boolean>
  }
}

export async function verifyHs256Bearer(authorization: string | undefined, issuer: string, secret: string): Promise<SpineJwtClaims> {
  return verifyBearer(authorization, issuer, { alg: 'HS256', secret })
}

export function requireAudience(aud: string) {
  return (c: SpineJwtClaims) => { if (c.aud !== aud) throw new Error('wrong_audience') }
}

export function requireScopes(scopes: string[]) {
  return (c: SpineJwtClaims) => {
    const set = new Set(c.scp)
    for (const s of scopes) if (!set.has(s)) throw new Error('missing_scope:' + s)
  }
}

export function denyIfBanned() {
  return (c: SpineJwtClaims) => { if (c.risk === 'banned') throw new Error('banned') }
}
