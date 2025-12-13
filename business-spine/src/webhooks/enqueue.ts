import { prisma } from "@/lib/prisma";
import { webhookQueue } from "@/src/queue/queues";

export async function emitWebhook(providerId: string, eventType: string, payload: any) {
  const endpoints = await prisma.webhookEndpoint.findMany({ where: { providerId, active: true } });
  for (const wh of endpoints) {
    if (wh.events?.length && !wh.events.includes(eventType)) continue;
    const delivery = await prisma.webhookDelivery.create({
      data: { webhookId: wh.id, eventType, payload, status: "queued", attempt: 0 }
    });
    await webhookQueue.add("deliver", { deliveryId: delivery.id }, { attempts: 10, backoff: { type: "exponential", delay: 2000 } });
  }
}
