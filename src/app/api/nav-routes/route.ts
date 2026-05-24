import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/utils/require-role";

export async function GET() {
  try {
    const routes = await prisma.nav_route.findMany({ orderBy: { sort_order: "asc" } });
    return NextResponse.json({ data: routes, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireRole(req, ["super_admin"]);
  if (denied) return denied;

  try {
    const { label, route, icon, sort_order } = await req.json();
    const navRoute = await prisma.nav_route.create({
      data: { label, route, icon: icon ?? "Circle", sort_order: sort_order ?? 99 },
    });
    return NextResponse.json({ data: navRoute, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireRole(req, ["super_admin"]);
  if (denied) return denied;

  try {
    const { id } = await req.json();
    await prisma.nav_route.delete({ where: { id } });
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 });
  }
}
