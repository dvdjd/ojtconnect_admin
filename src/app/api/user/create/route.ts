import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, password, type } = await request.json();

    if (!email || !password || !type) {
      return NextResponse.json({ error: "email, password, and type are required" }, { status: 400 });
    }

    const existing = await prisma.user_access.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }

    const user = await prisma.user_access.create({
      data: {
        user_id: randomUUID(),
        email,
        password,
        type,
        is_verify: true,
        is_active: true,
      },
    });

    return NextResponse.json({ data: user, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
