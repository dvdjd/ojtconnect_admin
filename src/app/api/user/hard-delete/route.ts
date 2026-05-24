import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const { user_id } = await request.json();

    await prisma.user_access.delete({ where: { user_id } });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
