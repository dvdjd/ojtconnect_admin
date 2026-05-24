import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/utils/generate-id";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const { user_id, type, data } = await request.json();

    if (!user_id || !type || !data) {
      return NextResponse.json({ error: "Missing user_id, type, or data" }, { status: 400 });
    }

    let profile = null;

    if (type === "student") {
      const student_id = await generateId(prisma, "S");
      profile = await prisma.student_profile.upsert({
        where: { user_id },
        update: data,
        create: { student_id, user_id, ...data },
      });
    } else if (type === "company") {
      const company_id = await generateId(prisma, "C");
      profile = await prisma.company_profile.upsert({
        where: { user_id },
        update: data,
        create: { company_id, user_id, name: "", ...data },
      });
    } else if (type === "university") {
      const university_id = await generateId(prisma, "T");
      profile = await prisma.university_profile.upsert({
        where: { user_id },
        update: data,
        create: {
          university_id,
          user_id,
          position: "",
          address_line: "",
          admin_name: "",
          department: "",
          university_name: "",
          university_type: "",
          country: "",
          state: "",
          ...data,
        },
      });
    }

    return NextResponse.json({ data: profile, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

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
