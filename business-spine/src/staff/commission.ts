import { prisma } from "@/lib/prisma";

export async function computeCommission(providerId: string, staffId: string, serviceId: string, grossCents: number) {
  const candidates = await prisma.commissionRule.findMany({
    where: {
      providerId,
      active: true,
      OR: [
        { staffId, serviceId },
        { staffId, serviceId: null },
        { staffId: null, serviceId },
        { staffId: null, serviceId: null },
      ]
    },
    take: 20
  });

  const score = (r:any) => (r.staffId ? 2 : 0) + (r.serviceId ? 1 : 0);
  const best = candidates.sort((a,b)=>score(b)-score(a))[0];
  if (!best) return 0;

  const pct = Math.floor((grossCents * best.percentBps) / 10000);
  return pct + (best.flatCents ?? 0);
}

export async function postCommission(providerId: string, bookingId: string, staffId: string, amountCents: number) {
  return prisma.commissionLedger.create({
    data: { providerId, bookingId, staffId, amountCents, status: "pending" }
  });
}
