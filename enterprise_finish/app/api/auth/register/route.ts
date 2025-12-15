import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { api } from "@/src/core/api";

const Q = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(200),
  role: z.enum(["owner","staff","client","admin"]).optional()
});

export async function POST(req: Request) {
  return api(async () => {
    const body = Q.parse(await req.json());
    const passwordHash = await argon2.hash(body.password, { type: argon2.argon2id });
    const user = await prisma.user.create({
      data: { email: body.email, role: (body.role ?? "client") as any, passwordHash }
    });
    return { userId: user.id };
  });
}
