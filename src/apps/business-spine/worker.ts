import { prisma } from "@/lib/prisma";
import { renderTemplate } from "./templates";
import { sendEmail } from "./adapters/sendgrid";
import { sendSms } from "./adapters/twilio";

export async function runOnce(limit = 50) {
  const batch = await prisma.messageLog.findMany({
    where: { status: "queued" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  for (const msg of batch) {
    try {
      const payload = msg.payload as any;
      const text = renderTemplate(msg.templateKey, payload.vars ?? {});
      if (msg.channel === "email") await sendEmail({ to: payload.to, subject: payload.subject ?? "Update", text });
      if (msg.channel === "sms") await sendSms({ to: payload.to, text });
      await prisma.messageLog.update({ where: { id: msg.id }, data: { status: "sent" } });
    } catch {
      await prisma.messageLog.update({ where: { id: msg.id }, data: { status: "failed" } });
    }
  }
}
