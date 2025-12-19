# Auth-Spine Multi-Client Starter (Generic)

This is a reusable, project-agnostic starter for **one Auth server** powering **many different apps/UIs** ("clients")
with hard separation via:
- `client_id` / `aud` (audience)
- `scp` (scopes)
- `risk` (ok/restricted/banned)
- `entitlements` (feature gates)

You can drop this into your Authentication-Spine repo as:
- `packages/auth-server`
- `packages/shared-auth`
- `packages/resource-api` (example service)
- `apps/demo-ui` (example client)

## Run
```bash
npm i
npm run dev:all
```

## URLs
- Auth Server: http://localhost:4000
- Resource API: http://localhost:4100
- Demo UI: http://localhost:5173

## Configure clients (the whole point)
Edit: `packages/auth-server/config/clients.json`

Each client defines:
- `client_id` (also becomes JWT `aud`)
- `allowed_scopes`
- optional `default_scopes`

Example:
```json
{
  "clients": [
    { "client_id": "drift_web", "allowed_scopes": ["hookups","profile:read"], "default_scopes": ["hookups"] },
    { "client_id": "drift_app", "allowed_scopes": ["connect","profile:read"], "default_scopes": ["connect"] }
  ]
}
```

## Configure users (demo only)
Edit: `packages/auth-server/config/users.json`

In real life you will replace this with DB lookup + real password hashing.

## Production note (not vibes)
This starter uses **HS256** (shared secret) so you can integrate fast.
If you want cleaner service separation, switch tokens to **RS256** and expose a JWKS.
