// Deno / Supabase Edge Functions helper

export type Handler = (req: Request, ctx: Record<string, unknown>) => Promise<Response>;
export type Middleware = (next: Handler) => Handler;

export function compose(handler: Handler, middlewares: Middleware[]): Handler {
  return middlewares.reduceRight((next, mw) => mw(next), handler);
}

export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function withCors(allowedOrigins: string[] = ["*"]): Middleware {
  return (next) => async (req, ctx) => {
    const origin = req.headers.get("origin") ?? "";
    const headers = new Headers();
    headers.set("access-control-allow-origin", allowedOrigins.includes("*") ? (origin || "*") : origin);
    headers.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    headers.set("access-control-allow-headers", "authorization,content-type,x-forwarded-for");
    headers.set("access-control-allow-credentials", "true");
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

    const res = await next(req, ctx);
    const merged = new Headers(res.headers);
    for (const [k, v] of headers) merged.set(k, v);
    return new Response(res.body, { status: res.status, headers: merged });
  };
}

export function withSecurityHeaders(): Middleware {
  return (next) => async (req, ctx) => {
    const res = await next(req, ctx);
    const h = new Headers(res.headers);
    h.set("x-frame-options", "DENY");
    h.set("x-content-type-options", "nosniff");
    h.set("referrer-policy", "no-referrer");
    h.set("permissions-policy", "geolocation=(), microphone=(), camera=()");
    // CSP is app-specific; set a default that won't nuke Supabase's own scripts.
    h.set("content-security-policy", "default-src 'self'; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'");
    return new Response(res.body, { status: res.status, headers: h });
  };
}
