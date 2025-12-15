import { cookies, headers } from "next/headers";
import { checkCsrf } from "./csrf";

export async function requireCsrf() {
  const c = (await cookies()).get("csrf")?.value ?? null;
  const h = (await headers()).get("x-csrf-token");
  if (!checkCsrf(c, h)) throw new Error("unauthorized");
}
