import React, { useState } from 'react'

const AUTH = 'http://localhost:4000'
const API = 'http://localhost:4100'

export function App() {
  const [email, setEmail] = useState('user1@demo.com')
  const [password, setPassword] = useState('password')
  const [clientId, setClientId] = useState('app_one')
  const [token, setToken] = useState<string | null>(null)
  const [out, setOut] = useState<any>(null)

  async function login() {
    setOut(null)
    const res = await fetch(AUTH + '/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, client_id: clientId })
    })
    const data = await res.json()
    if (!res.ok) return setOut(data)
    setToken(data.access_token)
    setOut({ ok:true, aud:data.aud, scp:data.scp })
  }

  async function callMe() {
    if (!token) return
    const res = await fetch(API + '/me', { headers: { authorization: 'Bearer ' + token } })
    setOut(await res.json())
  }

  async function createResource() {
    if (!token) return
    const res = await fetch(API + '/resource', {
      method:'POST',
      headers: { 'content-type':'application/json', authorization: 'Bearer ' + token },
      body: JSON.stringify({ name: 'example' })
    })
    setOut(await res.json())
  }

  return (
    <div className="wrap">
      <div className="card">
        <div className="h1">Auth-Spine Demo UI</div>
        <div className="p">Login to Auth-Spine with any <code>client_id</code> you defined in <code>clients.json</code>.</div>

        <div style={{height:10}} />
        <div className="row">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" />
          <input value={clientId} onChange={e=>setClientId(e.target.value)} placeholder="client_id" />
          <button className="btn primary" onClick={login}>Login</button>
        </div>

        <div style={{height:10}} />
        <div className="row">
          <button className="btn" disabled={!token} onClick={callMe}>Call /me</button>
          <button className="btn" disabled={!token} onClick={createResource}>POST /resource</button>
        </div>
      </div>

      <div style={{height:12}} />
      <div className="card">
        <div className="h1">Output</div>
        <pre>{out ? JSON.stringify(out, null, 2) : 'No output yet.'}</pre>
      </div>
    </div>
  )
}
