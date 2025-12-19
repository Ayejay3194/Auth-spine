import { prisma } from "@/lib/prisma";

export async function addPoints(providerId: string, clientId: string, delta: number) {
  const acct = await prisma.loyaltyAccount.upsert({
    where: { providerId_clientId: { providerId, clientId } } as any,
    create: { providerId, clientId, points: Math.max(0, delta), tier: "standard" },
    update: { points: { increment: delta } }
  }) as any;

  if (acct.points >= 1000 && acct.tier !== "vip") {
    await prisma.loyaltyAccount.update({ where: { id: acct.id }, data: { tier: "vip" } });
  }
  return acct;
}
