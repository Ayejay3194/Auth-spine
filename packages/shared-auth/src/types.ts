export type RiskState = 'ok' | 'restricted' | 'banned'

export type SpineJwtClaims = {
  iss: string
  sub: string
  aud: string           // client_id
  scp: string[]         // scopes
  risk: RiskState
  entitlements: Record<string, boolean>
}
