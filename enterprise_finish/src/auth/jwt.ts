import jwt from "jsonwebtoken";

export type JwtClaims = { sub: string; role: string; providerId?: string };

export function signToken(claims: JwtClaims, ttlSeconds = 60 * 60 * 24) {
  const secret = process.env.JWT_SECRET ?? "";
  if (!secret) throw new Error("JWT_SECRET missing");
  return jwt.sign(claims, secret, { algorithm: "HS256", expiresIn: ttlSeconds });
}

export function verifyToken(token: string): JwtClaims {
  const secret = process.env.JWT_SECRET ?? "";
  if (!secret) throw new Error("JWT_SECRET missing");
  return jwt.verify(token, secret, { algorithms: ["HS256"] }) as JwtClaims;
}
