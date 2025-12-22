import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor, AuthenticationError } from "@/src/core/auth";
import { audit } from "@/src/core/audit";
import { assertRole } from "@/src/core/policy";

const Q = z.object({
  providerId: z.string(),
  channel: z.enum(["email","sms","push"]),
  segment: z.string(),
  templateKey: z.string(),
  scheduledAtISO: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const actor = await getActor(req);
    assertRole(actor.role, ["owner","staff","admin"]);

    const body = Q.parse(await req.json());

    // Authorization: Verify user owns the provider or is admin
    if (actor.role !== "admin") {
      const provider = await prisma.provider.findUnique({
        where: { id: body.providerId },
        select: { userId: true }
      });
      
      if (!provider || provider.userId !== actor.userId) {
        return NextResponse.json(
          { error: "Unauthorized: You do not own this provider" },
          { status: 403 }
        );
      }
    }

    // Verify provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: body.providerId },
      select: { id: true }
    });
    
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    const c = await prisma.campaign.create({
      data: {
        providerId: body.providerId,
        channel: body.channel,
        segment: body.segment,
        templateKey: body.templateKey,
        status: "queued",
        scheduledAt: body.scheduledAtISO ? new Date(body.scheduledAtISO) : new Date(),
      }
    });

    await audit(actor.userId, actor.role as any, "marketing.campaign.create", { campaignId: c.id });

    return NextResponse.json({ campaignId: c.id });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Campaign creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
