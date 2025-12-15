import { registry } from "@/src/obs/metrics";

export async function GET() {
  const body = await registry.metrics();
  return new Response(body, { status: 200, headers: { "Content-Type": registry.contentType } });
}
