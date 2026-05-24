import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/utils/require-role";

export async function GET() {
  try {
    const permissions = await prisma.role_permission.findMany();
    return NextResponse.json({ data: permissions, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireRole(req, ["super_admin"]);
  if (denied) return denied;

  try {
    const { role_slug, route } = await req.json();
    const permission = await prisma.role_permission.create({
      data: { role_slug, route },
    });
    return NextResponse.json({ data: permission, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to add permission" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireRole(req, ["super_admin"]);
  if (denied) return denied;

  try {
    const { role_slug, route } = await req.json();
    await prisma.role_permission.deleteMany({ where: { role_slug, route } });
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to remove permission" }, { status: 500 });
  }
}
