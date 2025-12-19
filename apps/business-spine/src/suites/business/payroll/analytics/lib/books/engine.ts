
import { db } from "@/lib/db";

export type TrialRow = { accountId: string; code: string; name: string; type: string; debit: number; credit: number; balance: number };

export async function computeTrialBalance(asOf?: Date) {
  const accounts = await db.account.findMany({ orderBy: { code: "asc" } });
  const lines = await db.journalLine.findMany({
    where: asOf ? { entry: { postedAt: { lte: asOf } } } : {},
    include: { account: true }
  });

  const agg = new Map<string, { debit: number; credit: number }>();
  for (const a of accounts) agg.set(a.id, { debit: 0, credit: 0 });

  for (const l of lines) {
    const cur = agg.get(l.accountId) || { debit: 0, credit: 0 };
    cur.debit += l.debitCents;
    cur.credit += l.creditCents;
    agg.set(l.accountId, cur);
  }

  const rows: TrialRow[] = [];
  for (const a of accounts) {
    const { debit, credit } = agg.get(a.id)!;
    const balance = debit - credit; // debit-positive convention
    rows.push({ accountId: a.id, code: a.code, name: a.name, type: a.type, debit, credit, balance });
  }

  return rows;
}

export function requireBalanced(lines: Array<{ debitCents: number; creditCents: number }>) {
  const d = lines.reduce((s, x) => s + (x.debitCents || 0), 0);
  const c = lines.reduce((s, x) => s + (x.creditCents || 0), 0);
  if (d !== c) throw new Error(`UNBALANCED_JOURNAL: debits=${d} credits=${c}`);
}
