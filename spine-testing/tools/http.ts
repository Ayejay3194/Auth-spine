export async function http(method, url, { headers, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json", ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, ok: res.ok, json, text };
}
