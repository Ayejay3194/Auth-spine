
import { db } from "@/lib/db";

export async function assertPeriodOpen(postedAt: Date) {
  const periods = await db.period.findMany({ where: { startDate: { lte: postedAt }, endDate: { gte: postedAt } } });
  const hit = periods[0];
  if (hit?.isClosed) throw new Error("PERIOD_CLOSED");
}
