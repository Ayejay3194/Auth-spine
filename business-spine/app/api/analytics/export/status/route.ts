import { z } from "zod";
import { api } from "@/src/core/api";
import { prisma } from "@/lib/prisma";

const Q = z.object({ exportId: z.string() });

export async function POST(req: Request) {
  return api(async () => {
    const body = Q.parse(await req.json());
    const exp = await prisma.reportExport.findUnique({ where: { id: body.exportId } });
    if (!exp) return { error: "not_found" };
    return { status: exp.status, url: exp.url ?? null };
  });
}
