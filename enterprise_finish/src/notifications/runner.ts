import { prisma } from "@/lib/prisma";

export async function sendMessage(input: { providerId: string; clientId: string; channel: "email"|"sms"|"push"; templateKey: string; vars: Record<string, unknown> }) {
  const client = await prisma.client.findUnique({ where: { id: input.clientId }, include: { user: true } });
  const toEmail = client?.user?.email ?? "demo@example.com";
  const toPhone = client?.phone ?? "+15555550100";

  const payload = input.channel === "email"
    ? { to: toEmail, subject: "Appointment update", vars: input.vars }
    : { to: toPhone, vars: input.vars };

  await prisma.messageLog.create({
    data: {
      providerId: input.providerId,
      clientId: input.clientId,
      channel: input.channel,
      templateKey: input.templateKey,
      payload: payload as any,
      status: "queued",
    }
  });
}

export async function createTask(_input: { providerId: string; title: string }) {}
export async function schedule(_input: { runAtISO: string; event: any; ctx: any }) {}
