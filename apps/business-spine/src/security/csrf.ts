export function newCsrfToken() {
  const bytes = Array.from({ length: 24 }, () => Math.floor(Math.random() * 256));
  return Buffer.from(bytes).toString("base64url");
}

export function checkCsrf(cookieToken: string | null, headerToken: string | null) {
  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}
