import { z } from "zod";
import { api } from "@/src/core/api";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { assertRole } from "@/src/core/policy";
import { reportQueue } from "@/src/queue/queues";

const Q = z.object({ providerId: z.string(), report: z.string().default("invoices"), format: z.enum(["csv"]).default("csv") });

export async function POST(req: Request) {
  return api(async () => {
    const actor = getActor(req);
    assertRole(actor.role, ["owner","admin","staff"]);
    const body = Q.parse(await req.json());
    const exp = await prisma.reportExport.create({ data: { providerId: body.providerId, report: body.report, format: body.format, status: "queued" } });
    await reportQueue.add("export", { exportId: exp.id }, { attempts: 5, backoff: { type: "exponential", delay: 2000 } });
    return { exportId: exp.id, status: "queued" };
  });
}
