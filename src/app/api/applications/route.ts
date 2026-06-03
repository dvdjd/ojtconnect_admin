import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { filters = {}, page = 1, pageSize = 10 } = await request.json();

    const where: Record<string, unknown> = {};

    if (filters.status && filters.status !== "all") {
      where.status = filters.status === "Not Selected"
        ? { in: ["Not Selected", "rejected"] }
        : filters.status;
    }

    if (filters.company && filters.company.trim() !== "") {
      where.job_post = {
        company_profile: {
          name: { contains: filters.company.trim(), mode: "insensitive" },
        },
      };
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job_post: {
            include: { company_profile: true },
          },
          student_profile: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { application_date: "desc" },
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({ data: applications, total, status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
