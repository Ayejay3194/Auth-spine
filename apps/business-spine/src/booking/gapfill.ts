import { prisma } from "@/lib/prisma";

export async function findOpenSlots(providerId: string, from: Date, to: Date) {
  const slots = await prisma.availabilitySlot.findMany({
    where: { providerId, startAt: { gte: from, lt: to } },
    orderBy: { startAt: "asc" }
  });

  const booked = await prisma.booking.findMany({
    where: { providerId, startAt: { gte: from, lt: to }, status: { in: ["pending","confirmed"] } },
    select: { startAt: true, endAt: true }
  });

  const isTaken = (s:any) => booked.some(b => !(s.endAt <= b.startAt || s.startAt >= b.endAt));
  return slots.filter(s => !isTaken(s)).map(s => ({
    slotId: s.id, startISO: s.startAt.toISOString(), endISO: s.endAt.toISOString(), capacity: s.capacity
  }));
}
