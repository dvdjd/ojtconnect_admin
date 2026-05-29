import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// Returns empty array if the table doesn't exist yet (P2021), throws everything else
async function safeMany<T>(query: Promise<T[]>): Promise<T[]> {
  try {
    return await query;
  } catch (e: unknown) {
    if (isTableMissing(e)) return [];
    throw e;
  }
}

// No-ops if the table doesn't exist yet (P2021), throws everything else
async function safeDel(op: Promise<unknown>): Promise<void> {
  try {
    await op;
  } catch (e: unknown) {
    if (isTableMissing(e)) return;
    throw e;
  }
}

function isTableMissing(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2021"
  );
}

export async function DELETE(request: Request) {
  try {
    const { user_id } = await request.json();

    const user = await prisma.user_access.findUnique({
      where: { user_id },
      select: { email: true, type: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { email, type } = user;

    if (type === "company") {
      const company = await prisma.company_profile.findUnique({
        where: { user_id },
        select: { company_id: true },
      });

      if (company) {
        const { company_id } = company;

        const job_ids = (
          await safeMany(prisma.job_post.findMany({ where: { company_id }, select: { job_id: true } }))
        ).map((j) => j.job_id);

        const application_ids = (
          await safeMany(prisma.application.findMany({ where: { job_id: { in: job_ids } }, select: { application_id: true } }))
        ).map((a) => a.application_id);

        const placement_ids = (
          await safeMany(prisma.student_placement.findMany({ where: { company_id }, select: { placement_id: true } }))
        ).map((p) => p.placement_id);

        const ojt_ids = (
          await safeMany(prisma.ojt_tracking.findMany({ where: { job_id: { in: job_ids } }, select: { ojt_tracking_id: true } }))
        ).map((o) => o.ojt_tracking_id);

        await prisma.$transaction(async (tx) => {
          await safeDel(tx.student_evaluation.deleteMany({ where: { placement_id: { in: placement_ids } } }));
          await safeDel(tx.student_evaluation.deleteMany({ where: { OR: [{ evaluator_user_id: user_id }, { evaluatee_user_id: user_id }] } }));
          await safeDel(tx.employer_feedback.deleteMany({ where: { company_id } }));
          await safeDel(tx.feedback_draft.deleteMany({ where: { company_id } }));
          await safeDel(tx.student_placement.deleteMany({ where: { company_id } }));
          await safeDel(tx.interview_schedule.deleteMany({ where: { application_id: { in: application_ids } } }));
          await safeDel(tx.application.deleteMany({ where: { job_id: { in: job_ids } } }));
          await safeDel(tx.bookmark.deleteMany({ where: { job_id: { in: job_ids } } }));
          await safeDel(tx.job_requirement.deleteMany({ where: { job_id: { in: job_ids } } }));
          await safeDel(tx.job_skill_requirement.deleteMany({ where: { job_id: { in: job_ids } } }));
          await safeDel(tx.daily_time_record.deleteMany({ where: { ojt_tracking_id: { in: ojt_ids } } }));
          await safeDel(tx.ojt_tracking.deleteMany({ where: { job_id: { in: job_ids } } }));
          await safeDel(tx.employer_subscription.deleteMany({ where: { company_id } }));
          await tx.company_profile.delete({ where: { company_id } });
          await safeDel(tx.university_coordinator.deleteMany({ where: { user_id } }));
          await safeDel(tx.audit_log.deleteMany({ where: { user_id } }));
          await safeDel(tx.user_logs.deleteMany({ where: { email } }));
          await safeDel(tx.notification.deleteMany({ where: { user_id } }));
          await tx.user_access.delete({ where: { user_id } });
        });
      }
    } else if (type === "student") {
      const profile = await prisma.student_profile.findUnique({
        where: { user_id },
        select: { student_id: true },
      });

      if (profile) {
        const { student_id } = profile;

        const application_ids = (
          await safeMany(prisma.application.findMany({ where: { student_id }, select: { application_id: true } }))
        ).map((a) => a.application_id);

        const placement_ids = (
          await safeMany(prisma.student_placement.findMany({ where: { student_id }, select: { placement_id: true } }))
        ).map((p) => p.placement_id);

        const ojt_ids = (
          await safeMany(prisma.ojt_tracking.findMany({ where: { student_id }, select: { ojt_tracking_id: true } }))
        ).map((o) => o.ojt_tracking_id);

        await prisma.$transaction(async (tx) => {
          await safeDel(tx.student_evaluation.deleteMany({ where: { placement_id: { in: placement_ids } } }));
          await safeDel(tx.student_evaluation.deleteMany({ where: { OR: [{ evaluator_user_id: user_id }, { evaluatee_user_id: user_id }] } }));
          await safeDel(tx.employer_feedback.deleteMany({ where: { student_id } }));
          await safeDel(tx.feedback_draft.deleteMany({ where: { student_id } }));
          await safeDel(tx.student_placement.deleteMany({ where: { student_id } }));
          await safeDel(tx.interview_schedule.deleteMany({ where: { application_id: { in: application_ids } } }));
          await safeDel(tx.application.deleteMany({ where: { student_id } }));
          await safeDel(tx.bookmark.deleteMany({ where: { student_id } }));
          await safeDel(tx.daily_time_record.deleteMany({ where: { ojt_tracking_id: { in: ojt_ids } } }));
          await safeDel(tx.ojt_tracking.deleteMany({ where: { student_id } }));
          await safeDel(tx.resume_education.deleteMany({ where: { student_id } }));
          await safeDel(tx.resume_experience.deleteMany({ where: { student_id } }));
          await safeDel(tx.resume_skills.deleteMany({ where: { student_id } }));
          await safeDel(tx.student_document.deleteMany({ where: { student_id } }));
          await safeDel(tx.student_resume.deleteMany({ where: { student_id } }));
          await safeDel(tx.student_skill.deleteMany({ where: { student_id } }));
          await tx.student_profile.delete({ where: { student_id } });
          await safeDel(tx.university_coordinator.deleteMany({ where: { user_id } }));
          await safeDel(tx.audit_log.deleteMany({ where: { user_id } }));
          await safeDel(tx.user_logs.deleteMany({ where: { email } }));
          await safeDel(tx.notification.deleteMany({ where: { user_id } }));
          await tx.user_access.delete({ where: { user_id } });
        });
      }
    } else if (type === "university") {
      const profile = await prisma.university_profile.findUnique({
        where: { user_id },
        select: { university_id: true },
      });

      if (profile) {
        const { university_id } = profile;

        const department_ids = (
          await safeMany(prisma.university_department.findMany({ where: { university_id }, select: { department_id: true } }))
        ).map((d) => d.department_id);

        const subscription_ids = (
          await safeMany(prisma.university_subscription.findMany({ where: { university_id }, select: { subscription_id: true } }))
        ).map((s) => s.subscription_id);

        const ojt_ids = (
          await safeMany(prisma.ojt_tracking.findMany({ where: { university_id }, select: { ojt_tracking_id: true } }))
        ).map((o) => o.ojt_tracking_id);

        await prisma.$transaction(async (tx) => {
          await safeDel(tx.student_evaluation.deleteMany({ where: { OR: [{ evaluator_user_id: user_id }, { evaluatee_user_id: user_id }] } }));
          await safeDel(tx.daily_time_record.deleteMany({ where: { ojt_tracking_id: { in: ojt_ids } } }));
          await safeDel(tx.ojt_tracking.deleteMany({ where: { university_id } }));
          await safeDel(tx.billing_history.deleteMany({ where: { subscription_id: { in: subscription_ids } } }));
          await safeDel(tx.university_subscription.deleteMany({ where: { university_id } }));
          await safeDel(tx.university_course.deleteMany({ where: { department_id: { in: department_ids } } }));
          await safeDel(tx.university_department.deleteMany({ where: { university_id } }));
          await safeDel(tx.university_analytics_snapshot.deleteMany({ where: { university_id } }));
          await safeDel(tx.university_coordinator.deleteMany({ where: { university_id } }));
          await tx.university_profile.delete({ where: { university_id } });
          await safeDel(tx.audit_log.deleteMany({ where: { user_id } }));
          await safeDel(tx.user_logs.deleteMany({ where: { email } }));
          await safeDel(tx.notification.deleteMany({ where: { user_id } }));
          await tx.user_access.delete({ where: { user_id } });
        });
      }
    } else {
      await prisma.$transaction(async (tx) => {
        await safeDel(tx.student_evaluation.deleteMany({ where: { OR: [{ evaluator_user_id: user_id }, { evaluatee_user_id: user_id }] } }));
        await safeDel(tx.university_coordinator.deleteMany({ where: { user_id } }));
        await safeDel(tx.audit_log.deleteMany({ where: { user_id } }));
        await safeDel(tx.user_logs.deleteMany({ where: { email } }));
        await safeDel(tx.notification.deleteMany({ where: { user_id } }));
        await tx.user_access.delete({ where: { user_id } });
      });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to delete user", detail: message }, { status: 500 });
  }
}
