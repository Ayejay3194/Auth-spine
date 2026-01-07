export async function http(method, url, { headers, body, rawBody } = {}) {
  const res = await fetch(url, {
    method,
    headers: rawBody ? (headers || {}) : { "content-type": "application/json", ...(headers || {}) },
    body: rawBody ? rawBody : (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, ok: res.ok, json, text, headers: res.headers };
}
