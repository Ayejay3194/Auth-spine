import { NextRequest } from "next/server";
import { getContainer } from "@/src/server/infra/container";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const From = String(form.get("From") ?? "");
  const To = String(form.get("To") ?? "");
  const Body = String(form.get("Body") ?? "");

  const { sms } = getContainer();
  const replyText = await sms.handleInbound({ fromE164: From, toE164: To, body: Body });

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response><Message>${escapeXml(replyText)}</Message></Response>`;
  return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
