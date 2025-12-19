import { jwtVerify } from 'jose'
import { createSecretKey } from 'crypto'
import type { SpineJwtClaims } from './types'

export async function verifyHs256Bearer(authorization: string | undefined, issuer: string, secret: string): Promise<SpineJwtClaims> {
  if (!authorization || !authorization.startsWith('Bearer ')) throw new Error('missing_bearer')
  const token = authorization.slice('Bearer '.length)
  const key = createSecretKey(Buffer.from(secret, 'utf-8'))
  const { payload } = await jwtVerify(token, key, { issuer })
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
