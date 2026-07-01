import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  "for interview": "For Interview",
  "Interview Stage": "For Interview",
  accepted: "Accepted",
  Selected: "Accepted",
  "Not Selected": "Not Selected",
  rejected: "Not Selected",
  withdrawn: "Withdrawn",
};

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const company = searchParams.get("company");
    const position = searchParams.get("position");

    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.status =
        status === "Not Selected"
          ? { in: ["Not Selected", "rejected"] }
          : status === "for interview"
          ? { in: ["for interview", "Interview Stage"] }
          : status === "accepted"
          ? { in: ["accepted", "Selected"] }
          : status;
    }

    const jobPostFilter: Record<string, unknown> = {};

    if (company && company.trim() !== "") {
      jobPostFilter.company_profile = {
        name: { contains: company.trim(), mode: "insensitive" },
      };
    }

    if (position && position.trim() !== "") {
      jobPostFilter.position = { contains: position.trim(), mode: "insensitive" };
    }

    if (Object.keys(jobPostFilter).length > 0) {
      where.job_post = jobPostFilter;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job_post: {
          include: { company_profile: true },
        },
        student_profile: {
          include: { user_access: true },
        },
      },
      orderBy: { application_date: "desc" },
    });

    const headers = ["Student Name", "Email", "Position", "Company", "Status", "Application Date"];

    const rows = applications.map((app) => {
      const name = [app.student_profile.first_name, app.student_profile.last_name]
        .filter(Boolean)
        .join(" ");
      const email = app.student_profile.user_access?.email ?? "";
      const pos = app.job_post.position ?? "";
      const comp = app.job_post.company_profile.name ?? "";
      const statusLabel = STATUS_LABELS[app.status] ?? app.status;
      const date = new Date(app.application_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return [name, email, pos, comp, statusLabel, date].map(escapeCSV).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="applications-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export applications" }, { status: 500 });
  }
}
