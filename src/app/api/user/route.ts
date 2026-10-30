import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/utils/require-role";

const USERS_ROUTE_ROLES = ["super_admin", "recruitment", "marketing"];

export async function POST(request: NextRequest) {
  const denied = await requireRole(request, USERS_ROUTE_ROLES);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { filters, page, pageSize } = body;
    const where: Record<string, unknown> = {
      is_active: filters.is_active !== undefined ? filters.is_active : true,
    };

    if (filters.email && filters.email.trim() !== "") {
      where.email = {
        contains: filters.email,
        mode: "insensitive",
      };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.is_verify !== undefined) {
      where.is_verify = filters.is_verify;
    }

    const [users, total] = await Promise.all([
      prisma.user_access.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date_created: "desc" },
      }),
      prisma.user_access.count({ where }),
    ]);

    return NextResponse.json({ data: users, total, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const denied = await requireRole(request, USERS_ROUTE_ROLES);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { user_id } = body;

    const data: Record<string, unknown> = {};
    if (body.is_verify !== undefined) data.is_verify = body.is_verify;
    if (body.is_active !== undefined) data.is_active = body.is_active;

    const users = await prisma.user_access.update({
      where: { user_id },
      data,
    });

    return NextResponse.json({ data: users, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireRole(request, USERS_ROUTE_ROLES);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { user_id } = body;

    const users = await prisma.user_access.update({
      where: { user_id },
      data: { is_active: false },
    });

    return NextResponse.json({ data: users, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate user" },
      { status: 500 }
    );
  }
}

