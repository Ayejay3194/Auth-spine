import { cookies, headers } from "next/headers";
import { checkCsrf } from "./csrf";

export function requireCsrf() {
  const c = cookies().get("csrf")?.value ?? null;
  const h = headers().get("x-csrf-token");
  if (!checkCsrf(c, h)) throw new Error("unauthorized");
}
