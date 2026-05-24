import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const admins = await prisma.user_admin.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ data: admins, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json();
    const admin = await prisma.user_admin.create({
      data: { username, password, role },
    });
    return NextResponse.json({ data: admin, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, username, password, role } = await request.json();
    const data: Record<string, unknown> = { username, role };
    if (password) data.password = password;

    const admin = await prisma.user_admin.update({
      where: { id },
      data,
    });
    return NextResponse.json({ data: admin, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.user_admin.delete({ where: { id } });
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 });
  }
}
