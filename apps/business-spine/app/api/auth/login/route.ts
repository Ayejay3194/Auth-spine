import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { api } from "@/src/core/api";
import { signToken } from "@/src/auth/jwt";

const Q = z.object({
  email: z.string().email(),
  role: z.enum(["owner","staff","client","admin"]).optional()
});

export async function POST(req: Request) {
  return api(async () => {
    const body = Q.parse(await req.json());
    const user = await prisma.user.upsert({
      where: { email: body.email },
      create: { email: body.email, role: (body.role ?? "client") as any },
      update: {}
    });
    const token = signToken({ sub: user.id, role: user.role });
    return { token, userId: user.id, role: user.role };
  });
}
