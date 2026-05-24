import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/utils/require-role";

export async function GET() {
  try {
    const roles = await prisma.admin_role.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ data: roles, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireRole(req, ["super_admin"]);
  if (denied) return denied;

  try {
    const { name, slug } = await req.json();
    const role = await prisma.admin_role.create({ data: { name, slug } });
    return NextResponse.json({ data: role, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireRole(req, ["super_admin"]);
  if (denied) return denied;

  try {
    const { id } = await req.json();
    await prisma.admin_role.delete({ where: { id } });
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
