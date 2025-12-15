import { serialize } from "cookie";

export function setSessionCookie(token: string) {
  return serialize("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export function clearSessionCookie() {
  return serialize("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0
  });
}
