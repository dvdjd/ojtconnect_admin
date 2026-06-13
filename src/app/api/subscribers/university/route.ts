import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [allUniversities, activeSubscriptions, plans] = await Promise.all([
      prisma.university.findMany({
        select: { university_id: true, university_name: true },
        orderBy: { university_name: "asc" },
      }),
      prisma.university_subscription.findMany({
        where: { status: "active" },
        select: { university_id: true },
      }),
      prisma.subscription_plan.findMany({
        where: { is_active: true, plan_type: { in: ["university", "University"] } },
        select: { plan_id: true, plan_name: true, price_monthly: true },
        orderBy: { plan_name: "asc" },
      }),
    ]);

    // Exclude universities that already have an active subscription
    const subscribedIds = new Set(activeSubscriptions.map((s) => s.university_id));
    const universities = allUniversities.filter((u) => !subscribedIds.has(u.university_id));

    return NextResponse.json({ universities, plans, status: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { subscription_id, plan_id, renew } = await request.json();
    if (!subscription_id) {
      return NextResponse.json({ error: "Missing subscription_id" }, { status: 400 });
    }

    if (renew) {
      const existing = await prisma.university_subscription.findUnique({
        where: { subscription_id },
        select: { billing_cycle: true, current_period_end: true },
      });
      if (!existing) {
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
      }
      const newEnd = new Date(existing.current_period_end);
      if (existing.billing_cycle === "annual") newEnd.setFullYear(newEnd.getFullYear() + 1);
      else newEnd.setMonth(newEnd.getMonth() + 1);

      const updated = await prisma.university_subscription.update({
        where: { subscription_id },
        data: { current_period_end: newEnd, status: "active" },
      });
      return NextResponse.json({ data: updated, status: "success" });
    }

    if (!plan_id) {
      return NextResponse.json({ error: "Missing plan_id" }, { status: 400 });
    }
    const updated = await prisma.university_subscription.update({
      where: { subscription_id },
      data: { plan_id },
      include: {
        subscription_plan: { select: { plan_name: true } },
      },
    });
    return NextResponse.json({ data: updated, status: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { subscription_id } = await request.json();
    if (!subscription_id) {
      return NextResponse.json({ error: "Missing subscription_id" }, { status: 400 });
    }
    await prisma.university_subscription.update({
      where: { subscription_id },
      data: { status: "cancelled" },
    });
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to remove subscription" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { university_id, plan_id, billing_cycle, current_period_start, current_period_end } =
      await request.json();

    if (!university_id || !plan_id || !current_period_start || !current_period_end) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // university_subscription FKs to university_profile, not university.
    // Find the profile whose university_id matches, or fall back to name match.
    const university = await prisma.university.findUnique({
      where: { university_id },
      select: { university_name: true },
    });
    if (!university) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    const profile = await prisma.university_profile.findFirst({
      where: {
        OR: [
          { university_id },
          { university_name: university.university_name },
        ],
      },
      select: { university_id: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "No university profile found for this university" }, { status: 404 });
    }

    const profileId = profile.university_id;

    const existing = await prisma.university_subscription.findFirst({
      where: { university_id: profileId, status: "active" },
    });
    if (existing) {
      return NextResponse.json({ error: "This university already has an active subscription" }, { status: 409 });
    }

    const subscription = await prisma.university_subscription.create({
      data: {
        subscription_id: randomUUID(),
        university_id: profileId,
        plan_id,
        billing_cycle: billing_cycle ?? "monthly",
        status: "active",
        current_period_start: new Date(current_period_start),
        current_period_end: new Date(current_period_end),
      },
      include: {
        university_profile: { select: { university_name: true } },
        subscription_plan: { select: { plan_name: true, plan_type: true, price_monthly: true } },
      },
    });

    return NextResponse.json({ data: subscription, status: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
