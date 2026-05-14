import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalUsers,
      studentCount,
      companyCount,
      universityCount,
      verifiedCount,
      pendingCount,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      totalJobs,
    ] = await Promise.all([
      prisma.user_access.count(),
      prisma.user_access.count({ where: { type: "student" } }),
      prisma.user_access.count({ where: { type: "company" } }),
      prisma.user_access.count({ where: { type: "university" } }),
      prisma.user_access.count({ where: { is_verify: true } }),
      prisma.user_access.count({ where: { is_verify: false } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: "pending" } }),
      prisma.application.count({ where: { status: "accepted" } }),
      prisma.application.count({ where: { status: "rejected" } }),
      prisma.job_post.count(),
    ]);

    return NextResponse.json({
      data: {
        users: {
          total: totalUsers,
          students: studentCount,
          companies: companyCount,
          universities: universityCount,
          verified: verifiedCount,
          pending: pendingCount,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
        },
        jobs: {
          total: totalJobs,
        },
      },
      status: "success",
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
