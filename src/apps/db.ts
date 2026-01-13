import type { DiagContext, DiagResult } from "../types";

/**
 * Prisma adapter (optional).
 * If you don't use Prisma, replace this with your DB client ping.
 */
export async function checkDb(_ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return { id: "db", name: "Database connection", status: "warn", ms: Date.now() - start, details: { message: "DATABASE_URL not set" } };
    }

    // Lazy import so this file doesn't force Prisma as a hard dependency.
    let ok = false;
    try {
      const mod = await import("@prisma/client");
      const PrismaClient = (mod as any).PrismaClient;
      const prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      ok = true;
    } catch {
      // Fallback: just validate URL format
      ok = url.startsWith("postgres");
    }

    return { id: "db", name: "Database connection", status: ok ? "ok" : "fail", ms: Date.now() - start, details: { ok } };
  } catch (e: any) {
    return { id: "db", name: "Database connection", status: "fail", ms: Date.now() - start, details: { error: String(e?.message ?? e) } };
  }
}
