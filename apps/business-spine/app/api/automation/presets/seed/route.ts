import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { defaultPresets } from "@/src/automation/presets";
import { getActor } from "@/src/core/auth";
import { audit } from "@/src/core/audit";
import { assertRole } from "@/src/core/policy";

const Q = z.object({ providerId: z.string() });

export async function POST(req: Request) {
  const actor = getActor(req);
  assertRole(actor.role, ["owner","admin","staff"]);

  const body = Q.parse(await req.json());
  const presets = defaultPresets(body.providerId);

  const created = [];
  for (const p of presets) {
    const r = await prisma.automationRule.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        providerId: body.providerId,
        name: p.name,
        trigger: p.trigger,
        enabled: p.enabled,
        configJson: p.config as any
      },
      update: {
        name: p.name,
        trigger: p.trigger,
        enabled: p.enabled,
        configJson: p.config as any
      }
    });
    created.push(r.id);
  }

  await audit(actor.userId, actor.role as any, "automation.presets.seed", { providerId: body.providerId, created });

  return NextResponse.json({ ok: true, created });
}
