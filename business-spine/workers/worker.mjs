import { Worker } from "bullmq";
import Redis from "ioredis";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { stringify } from "csv-stringify/sync";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const url = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new Redis(url);

const log = (m) => console.log("[worker]", m);

function sign(secret, body, ts) {
  return crypto.createHmac("sha256", secret).update(ts + "." + body).digest("hex");
}

new Worker("webhooks", async job => {
  const { deliveryId } = job.data;
  const delivery = await prisma.webhookDelivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) return { ok: false };

  const wh = await prisma.webhookEndpoint.findUnique({ where: { id: delivery.webhookId } });
  if (!wh || !wh.active) {
    await prisma.webhookDelivery.update({ where: { id: deliveryId }, data: { status: "failed", lastError: "endpoint_inactive" } });
    return { ok: false };
  }

  const body = JSON.stringify({ type: delivery.eventType, payload: delivery.payload });
  const ts = String(Date.now());
  const sig = sign(wh.secret, body, ts);

  const res = await fetch(wh.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Timestamp": ts,
      "X-Webhook-Signature": sig
    },
    body
  });

  if (!res.ok) {
    const err = `http_${res.status}`;
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: { attempt: { increment: 1 }, lastError: err }
    });
    throw new Error(err);
  }

  await prisma.webhookDelivery.update({
    where: { id: deliveryId },
    data: { status: "delivered", deliveredAt: new Date(), lastError: null }
  });

  return { delivered: true };
}, { connection });

new Worker("reports", async job => {
  const { exportId } = job.data;
  const exp = await prisma.reportExport.findUnique({ where: { id: exportId } });
  if (!exp) return { ok: false };

  // Demo report: invoices by provider
  const invoices = await prisma.invoice.findMany({ where: { providerId: exp.providerId }, take: 500, orderBy: { createdAt: "desc" } });
  const rows = invoices.map(i => ({ invoiceId: i.id, amount: i.amount, status: i.status, createdAt: i.createdAt.toISOString() }));

  const csv = stringify(rows, { header: true });
  const dir = path.join(process.cwd(), "public", "exports");
  fs.mkdirSync(dir, { recursive: true });
  const filename = `export_${exportId}.csv`;
  fs.writeFileSync(path.join(dir, filename), csv);

  const url = `/exports/${filename}`;
  await prisma.reportExport.update({ where: { id: exportId }, data: { status: "ready", url } });
  return { url };
}, { connection });

log("Enterprise workers up.");
