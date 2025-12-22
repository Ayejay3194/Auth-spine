import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor, AuthenticationError } from "@/src/core/auth";
import { audit } from "@/src/core/audit";
import { assertRole } from "@/src/core/policy";

const Q = z.object({ providerId: z.string(), name: z.string(), role: z.string().optional(), userId: z.string().optional() });

export async function POST(req: Request) {
  try {
    const actor = await getActor(req);
    assertRole(actor.role, ["owner","admin"]);

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

    const staff = await prisma.staffMember.create({
      data: { providerId: body.providerId, name: body.name, role: body.role ?? "staff", userId: body.userId ?? null }
    });

    await audit(actor.userId, actor.role as any, "staff.add", { staffId: staff.id });
    return NextResponse.json({ staffId: staff.id });
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

    console.error("Staff addition error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
