import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { filters = {}, page = 1, pageSize = 10 } = await request.json();

    const statusFilter = filters.status && filters.status !== "all"
      ? { status: filters.status }
      : {};

    const typeFilter = filters.type && filters.type !== "all"
      ? filters.type
      : null;

    const nameSearch = filters.name?.trim() || null;

    const [employers, employerTotal, universities, universityTotal] = await Promise.all([
      typeFilter === "university" ? Promise.resolve([]) :
        prisma.employer_subscription.findMany({
          where: {
            ...statusFilter,
            ...(nameSearch ? {
              company_profile: { name: { contains: nameSearch, mode: "insensitive" } },
            } : {}),
          },
          include: {
            company_profile: { select: { name: true } },
            subscription_plan: { select: { plan_name: true, plan_type: true, price_monthly: true } },
          },
          orderBy: { date_created: "desc" },
          skip: typeFilter === "company" ? (page - 1) * pageSize : 0,
          take: typeFilter === "company" ? pageSize : 1000,
        }),
      typeFilter === "university" ? Promise.resolve(0) :
        prisma.employer_subscription.count({
          where: {
            ...statusFilter,
            ...(nameSearch ? {
              company_profile: { name: { contains: nameSearch, mode: "insensitive" } },
            } : {}),
          },
        }),
      typeFilter === "company" ? Promise.resolve([]) :
        prisma.university_subscription.findMany({
          where: {
            ...statusFilter,
            ...(nameSearch ? {
              university_profile: { university_name: { contains: nameSearch, mode: "insensitive" } },
            } : {}),
          },
          include: {
            university_profile: { select: { university_name: true } },
            subscription_plan: { select: { plan_name: true, plan_type: true, price_monthly: true } },
          },
          orderBy: { date_created: "desc" },
          skip: typeFilter === "university" ? (page - 1) * pageSize : 0,
          take: typeFilter === "university" ? pageSize : 1000,
        }),
      typeFilter === "company" ? Promise.resolve(0) :
        prisma.university_subscription.count({
          where: {
            ...statusFilter,
            ...(nameSearch ? {
              university_profile: { university_name: { contains: nameSearch, mode: "insensitive" } },
            } : {}),
          },
        }),
    ]);

    const now = new Date();
    const deriveStatus = (status: string, periodEnd: Date) =>
      status === "active" && periodEnd < now ? "expired" : status;

    // Opportunistically expire stale active records in the background
    const expiredEmployerIds = employers
      .filter((s) => s.status === "active" && s.current_period_end < now)
      .map((s) => s.subscription_id);
    const expiredUniversityIds = universities
      .filter((s) => s.status === "active" && s.current_period_end < now)
      .map((s) => s.subscription_id);
    if (expiredEmployerIds.length > 0 || expiredUniversityIds.length > 0) {
      Promise.all([
        expiredEmployerIds.length > 0
          ? prisma.employer_subscription.updateMany({
              where: { subscription_id: { in: expiredEmployerIds } },
              data: { status: "expired" },
            })
          : Promise.resolve(),
        expiredUniversityIds.length > 0
          ? prisma.university_subscription.updateMany({
              where: { subscription_id: { in: expiredUniversityIds } },
              data: { status: "expired" },
            })
          : Promise.resolve(),
      ]).catch(console.error);
    }

    const combined = [
      ...employers.map((s) => ({
        subscription_id: s.subscription_id,
        type: "company" as const,
        name: s.company_profile.name,
        plan_name: s.subscription_plan.plan_name,
        plan_type: s.subscription_plan.plan_type,
        price_monthly: Number(s.subscription_plan.price_monthly),
        billing_cycle: s.billing_cycle,
        status: deriveStatus(s.status, s.current_period_end),
        current_period_start: s.current_period_start,
        current_period_end: s.current_period_end,
        date_created: s.date_created,
      })),
      ...universities.map((s) => ({
        subscription_id: s.subscription_id,
        type: "university" as const,
        name: s.university_profile.university_name,
        plan_id: s.plan_id,
        plan_name: s.subscription_plan.plan_name,
        plan_type: s.subscription_plan.plan_type,
        price_monthly: Number(s.subscription_plan.price_monthly),
        billing_cycle: s.billing_cycle,
        status: deriveStatus(s.status, s.current_period_end),
        current_period_start: s.current_period_start,
        current_period_end: s.current_period_end,
        date_created: s.date_created,
      })),
    ];

    // When showing all types, sort combined and paginate manually
    const data = typeFilter
      ? combined
      : combined
          .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
          .slice((page - 1) * pageSize, page * pageSize);

    const total = typeFilter
      ? typeFilter === "company" ? employerTotal : universityTotal
      : employerTotal + universityTotal;

    return NextResponse.json({ data, total, status: "success" });
  } catch (error) {
    console.error("Subscribers error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}
