import type { Role } from "@prisma/client";

/**
 * Template auth. Replace with NextAuth/Clerk.
 * For now we accept headers:
 *  x-user-id, x-role
 */
export function getActor(req: Request): { userId: string; role: Role } {
  const userId = req.headers.get("x-user-id") ?? "user_demo";
  const role = (req.headers.get("x-role") ?? "owner") as Role;
  return { userId, role };
}
