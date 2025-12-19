import { Queue } from "bullmq";
import { redis } from "@/src/redis/client";

function connection() { return redis() as any; }

export const campaignQueue = new Queue("campaigns", { connection: connection() });
export const reportQueue = new Queue("reports", { connection: connection() });
export const webhookQueue = new Queue("webhooks", { connection: connection() });
