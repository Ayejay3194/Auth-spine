import fs from 'fs'
import path from 'path'

export type ClientConfig = {
  client_id: string
  allowed_scopes: string[]
  default_scopes?: string[]
}

export type UserConfig = {
  id: string
  email: string
  password: string
  role?: string
  scopes: string[]
  risk?: 'ok' | 'restricted' | 'banned'
  entitlements?: Record<string, boolean>
  mfa?: {
    enabled: boolean
    code: string
  }
}

function readJson<T>(rel: string): T {
  const p = path.join(process.cwd(), rel)
  const raw = fs.readFileSync(p, 'utf-8')
  return JSON.parse(raw) as T
}

export function loadClients(): ClientConfig[] {
  return readJson<{clients: ClientConfig[]}>('config/clients.json').clients
}

export function loadUsers(): UserConfig[] {
  return readJson<{users: UserConfig[]}>('config/users.json').users
}
