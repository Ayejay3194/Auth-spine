import client from "prom-client";

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });
