import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/utils/generate-id";

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

    const user_id = await generateId(prisma, "U");

    await prisma.user_access.create({
      data: { user_id, email, password, type, is_verify: true, is_active: true },
    });

    if (type === "student") {
      const student_id = await generateId(prisma, "S");
      await prisma.student_profile.create({
        data: { student_id, user_id },
      });
    } else if (type === "company") {
      const company_id = await generateId(prisma, "C");
      await prisma.company_profile.create({
        data: { company_id, user_id, name: "" },
      });
    } else if (type === "university") {
      const university_id = await generateId(prisma, "T");
      await prisma.university_profile.create({
        data: {
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
        },
      });
    }

    const user = await prisma.user_access.findUnique({ where: { user_id } });
    return NextResponse.json({ data: user, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
