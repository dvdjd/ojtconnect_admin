import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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
      notSelectedApplications,
      interviewApplications,
      newSignups7d,
      newSignups30d,
      totalJobs,
      topCompaniesByJobs,
      topCompaniesByApplicants,
      applicantsPerCompany,
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
      prisma.application.count({ where: { status: { in: ["Not Selected", "rejected"] } } }),
      prisma.application.count({ where: { status: "for interview" } }),
      prisma.user_access.count({ where: { type: "student", date_created: { gte: sevenDaysAgo } } }),
      prisma.user_access.count({ where: { type: "student", date_created: { gte: thirtyDaysAgo } } }),
      prisma.job_post.count(),
      prisma.$queryRaw<{ name: string; job_count: number }[]>`
        SELECT cp.name, COUNT(jp.job_id)::int AS job_count
        FROM job_post jp
        JOIN company_profile cp ON jp.company_id = cp.company_id
        WHERE jp.is_deleted = false
        GROUP BY cp.company_id, cp.name
        ORDER BY job_count DESC
        LIMIT 10
      `,
      prisma.$queryRaw<{ name: string; applicant_count: number }[]>`
        SELECT cp.name, COUNT(a.application_id)::int AS applicant_count
        FROM application a
        JOIN job_post jp ON a.job_id = jp.job_id
        JOIN company_profile cp ON jp.company_id = cp.company_id
        GROUP BY cp.company_id, cp.name
        ORDER BY applicant_count DESC
        LIMIT 3
      `,
      prisma.$queryRaw<{ name: string; applicant_count: number }[]>`
        SELECT cp.name, COUNT(a.application_id)::int AS applicant_count
        FROM application a
        JOIN job_post jp ON a.job_id = jp.job_id
        JOIN company_profile cp ON jp.company_id = cp.company_id
        GROUP BY cp.company_id, cp.name
        ORDER BY applicant_count DESC
      `,
    ]);

    // Prisma returns BigInt from raw queries even with ::int cast on some versions
    const toNum = (v: unknown) => (typeof v === "bigint" ? Number(v) : (v as number));

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
          rejected: notSelectedApplications,
          interview: interviewApplications,
        },
        signups: {
          last7d: newSignups7d,
          last30d: newSignups30d,
        },
        jobs: {
          total: totalJobs,
        },
        topCompaniesByJobs: topCompaniesByJobs.map((r) => ({
          name: r.name,
          count: toNum(r.job_count),
        })),
        topCompaniesByApplicants: topCompaniesByApplicants.map((r) => ({
          name: r.name,
          count: toNum(r.applicant_count),
        })),
        applicantsPerCompany: applicantsPerCompany.map((r) => ({
          name: r.name,
          count: toNum(r.applicant_count),
        })),
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
