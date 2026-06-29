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
        : filters.status === "for interview"
        ? { in: ["for interview", "Interview Stage"] }
        : filters.status === "accepted"
        ? { in: ["accepted", "Selected"] }
        : filters.status;
    }

    const jobPostFilter: Record<string, unknown> = {};

    if (filters.company && filters.company.trim() !== "") {
      jobPostFilter.company_profile = {
        name: { contains: filters.company.trim(), mode: "insensitive" },
      };
    }

    if (filters.position && filters.position.trim() !== "") {
      jobPostFilter.position = { contains: filters.position.trim(), mode: "insensitive" };
    }

    if (Object.keys(jobPostFilter).length > 0) {
      where.job_post = jobPostFilter;
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
