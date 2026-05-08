import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user_id, type } = await request.json();

    if (!user_id || !type) {
      return NextResponse.json({ error: "Missing user_id or type" }, { status: 400 });
    }

    let profile = null;

    if (type === "student") {
      profile = await prisma.student_profile.findUnique({ where: { user_id } });
    } else if (type === "company") {
      profile = await prisma.company_profile.findUnique({ where: { user_id } });
    } else if (type === "university") {
      profile = await prisma.university_profile.findUnique({ where: { user_id } });
    }

    return NextResponse.json({ data: profile, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
