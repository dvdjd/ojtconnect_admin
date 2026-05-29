import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// Tables that may not exist yet in all environments
const OPTIONAL_TABLES = [
  "ojt_tracking", "daily_time_record", "student_evaluation", "student_placement",
  "interview_schedule", "employer_feedback", "feedback_draft", "job_requirement",
  "job_skill_requirement", "resume_education", "resume_experience", "resume_skills",
  "student_document", "student_skill", "student_resume", "university_coordinator",
  "audit_log", "user_logs", "notification", "bookmark", "university_analytics_snapshot",
  "university_course", "university_department", "university_subscription",
  "billing_history", "employer_subscription",
];

async function getExistingTables(): Promise<Set<string>> {
  const inList = OPTIONAL_TABLES.map((t) => `'${t}'`).join(",");
  const rows = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (${inList})`
  );
  return new Set(rows.map((r) => r.tablename));
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
    const t = await getExistingTables();
    const has = (table: string) => t.has(table);

    if (type === "company") {
      const company = await prisma.company_profile.findUnique({
        where: { user_id },
        select: { company_id: true },
      });

      if (company) {
        const { company_id } = company;

        const job_ids = has("job_post")
          ? (await prisma.job_post.findMany({ where: { company_id }, select: { job_id: true } })).map((j) => j.job_id)
          : [];

        const application_ids = has("application") && job_ids.length
          ? (await prisma.application.findMany({ where: { job_id: { in: job_ids } }, select: { application_id: true } })).map((a) => a.application_id)
          : [];

        const placement_ids = has("student_placement")
          ? (await prisma.student_placement.findMany({ where: { company_id }, select: { placement_id: true } })).map((p) => p.placement_id)
          : [];

        const ojt_ids = has("ojt_tracking") && job_ids.length
          ? (await prisma.ojt_tracking.findMany({ where: { job_id: { in: job_ids } }, select: { ojt_tracking_id: true } })).map((o) => o.ojt_tracking_id)
          : [];

        await prisma.$transaction([
          ...(has("student_evaluation") && placement_ids.length ? [prisma.student_evaluation.deleteMany({ where: { placement_id: { in: placement_ids } } })] : []),
          ...(has("student_evaluation") ? [prisma.student_evaluation.deleteMany({ where: { OR: [{ evaluator_user_id: user_id }, { evaluatee_user_id: user_id }] } })] : []),
          ...(has("employer_feedback") ? [prisma.employer_feedback.deleteMany({ where: { company_id } })] : []),
          ...(has("feedback_draft") ? [prisma.feedback_draft.deleteMany({ where: { company_id } })] : []),
          ...(has("student_placement") ? [prisma.student_placement.deleteMany({ where: { company_id } })] : []),
          ...(has("interview_schedule") && application_ids.length ? [prisma.interview_schedule.deleteMany({ where: { application_id: { in: application_ids } } })] : []),
          ...(has("application") && job_ids.length ? [prisma.application.deleteMany({ where: { job_id: { in: job_ids } } })] : []),
          ...(has("bookmark") && job_ids.length ? [prisma.bookmark.deleteMany({ where: { job_id: { in: job_ids } } })] : []),
          ...(has("job_requirement") && job_ids.length ? [prisma.job_requirement.deleteMany({ where: { job_id: { in: job_ids } } })] : []),
          ...(has("job_skill_requirement") && job_ids.length ? [prisma.job_skill_requirement.deleteMany({ where: { job_id: { in: job_ids } } })] : []),
          ...(has("daily_time_record") && ojt_ids.length ? [prisma.daily_time_record.deleteMany({ where: { ojt_tracking_id: { in: ojt_ids } } })] : []),
          ...(has("ojt_tracking") && job_ids.length ? [prisma.ojt_tracking.deleteMany({ where: { job_id: { in: job_ids } } })] : []),
          ...(has("employer_subscription") ? [prisma.employer_subscription.deleteMany({ where: { company_id } })] : []),
          prisma.company_profile.delete({ where: { company_id } }),
          ...(has("university_coordinator") ? [prisma.university_coordinator.deleteMany({ where: { user_id } })] : []),
          ...(has("audit_log") ? [prisma.audit_log.deleteMany({ where: { user_id } })] : []),
          ...(has("user_logs") ? [prisma.user_logs.deleteMany({ where: { email } })] : []),
          ...(has("notification") ? [prisma.notification.deleteMany({ where: { user_id } })] : []),
          prisma.user_access.delete({ where: { user_id } }),
        ]);
      }
    } else if (type === "student") {
      const profile = await prisma.student_profile.findUnique({
        where: { user_id },
        select: { student_id: true },
      });

      if (profile) {
        const { student_id } = profile;

        const application_ids = has("application")
          ? (await prisma.application.findMany({ where: { student_id }, select: { application_id: true } })).map((a) => a.application_id)
          : [];

        const placement_ids = has("student_placement")
          ? (await prisma.student_placement.findMany({ where: { student_id }, select: { placement_id: true } })).map((p) => p.placement_id)
          : [];

        const ojt_ids = has("ojt_tracking")
          ? (await prisma.ojt_tracking.findMany({ where: { student_id }, select: { ojt_tracking_id: true } })).map((o) => o.ojt_tracking_id)
          : [];

        await prisma.$transaction([
          ...(has("student_evaluation") && placement_ids.length ? [prisma.student_evaluation.deleteMany({ where: { placement_id: { in: placement_ids } } })] : []),
          ...(has("student_evaluation") ? [prisma.student_evaluation.deleteMany({ where: { OR: [{ evaluator_user_id: user_id }, { evaluatee_user_id: user_id }] } })] : []),
          ...(has("employer_feedback") ? [prisma.employer_feedback.deleteMany({ where: { student_id } })] : []),
          ...(has("feedback_draft") ? [prisma.feedback_draft.deleteMany({ where: { student_id } })] : []),
          ...(has("student_placement") ? [prisma.student_placement.deleteMany({ where: { student_id } })] : []),
          ...(has("interview_schedule") && application_ids.length ? [prisma.interview_schedule.deleteMany({ where: { application_id: { in: application_ids } } })] : []),
          ...(has("application") ? [prisma.application.deleteMany({ where: { student_id } })] : []),
          ...(has("bookmark") ? [prisma.bookmark.deleteMany({ where: { student_id } })] : []),
          ...(has("daily_time_record") && ojt_ids.length ? [prisma.daily_time_record.deleteMany({ where: { ojt_tracking_id: { in: ojt_ids } } })] : []),
          ...(has("ojt_tracking") ? [prisma.ojt_tracking.deleteMany({ where: { student_id } })] : []),
          ...(has("resume_education") ? [prisma.resume_education.deleteMany({ where: { student_id } })] : []),
          ...(has("resume_experience") ? [prisma.resume_experience.deleteMany({ where: { student_id } })] : []),
          ...(has("resume_skills") ? [prisma.resume_skills.deleteMany({ where: { student_id } })] : []),
          ...(has("student_document") ? [prisma.student_document.deleteMany({ where: { student_id } })] : []),
          ...(has("student_resume") ? [prisma.student_resume.deleteMany({ where: { student_id } })] : []),
          ...(has("student_skill") ? [prisma.student_skill.deleteMany({ where: { student_id } })] : []),
          prisma.student_profile.delete({ where: { student_id } }),
          ...(has("university_coordinator") ? [prisma.university_coordinator.deleteMany({ where: { user_id } })] : []),
          ...(has("audit_log") ? [prisma.audit_log.deleteMany({ where: { user_id } })] : []),
          ...(has("user_logs") ? [prisma.user_logs.deleteMany({ where: { email } })] : []),
          ...(has("notification") ? [prisma.notification.deleteMany({ where: { user_id } })] : []),
          prisma.user_access.delete({ where: { user_id } }),
        ]);
      }
    } else if (type === "university") {
      const profile = await prisma.university_profile.findUnique({
        where: { user_id },
        select: { university_id: true },
      });

      if (profile) {
        const { university_id } = profile;

        const department_ids = has("university_department")
          ? (await prisma.university_department.findMany({ where: { university_id }, select: { department_id: true } })).map((d) => d.department_id)
          : [];

        const subscription_ids = has("university_subscription")
          ? (await prisma.university_subscription.findMany({ where: { university_id }, select: { subscription_id: true } })).map((s) => s.subscription_id)
          : [];

        const ojt_ids = has("ojt_tracking")
          ? (await prisma.ojt_tracking.findMany({ where: { university_id }, select: { ojt_tracking_id: true } })).map((o) => o.ojt_tracking_id)
          : [];

        await prisma.$transaction([
          ...(has("student_evaluation") ? [prisma.student_evaluation.deleteMany({ where: { OR: [{ evaluator_user_id: user_id }, { evaluatee_user_id: user_id }] } })] : []),
          ...(has("daily_time_record") && ojt_ids.length ? [prisma.daily_time_record.deleteMany({ where: { ojt_tracking_id: { in: ojt_ids } } })] : []),
          ...(has("ojt_tracking") ? [prisma.ojt_tracking.deleteMany({ where: { university_id } })] : []),
          ...(has("billing_history") && subscription_ids.length ? [prisma.billing_history.deleteMany({ where: { subscription_id: { in: subscription_ids } } })] : []),
          ...(has("university_subscription") ? [prisma.university_subscription.deleteMany({ where: { university_id } })] : []),
          ...(has("university_course") && department_ids.length ? [prisma.university_course.deleteMany({ where: { department_id: { in: department_ids } } })] : []),
          ...(has("university_department") ? [prisma.university_department.deleteMany({ where: { university_id } })] : []),
          ...(has("university_analytics_snapshot") ? [prisma.university_analytics_snapshot.deleteMany({ where: { university_id } })] : []),
          ...(has("university_coordinator") ? [prisma.university_coordinator.deleteMany({ where: { university_id } })] : []),
          prisma.university_profile.delete({ where: { university_id } }),
          ...(has("audit_log") ? [prisma.audit_log.deleteMany({ where: { user_id } })] : []),
          ...(has("user_logs") ? [prisma.user_logs.deleteMany({ where: { email } })] : []),
          ...(has("notification") ? [prisma.notification.deleteMany({ where: { user_id } })] : []),
          prisma.user_access.delete({ where: { user_id } }),
        ]);
      }
    } else {
      await prisma.$transaction([
        ...(has("student_evaluation") ? [prisma.student_evaluation.deleteMany({ where: { OR: [{ evaluator_user_id: user_id }, { evaluatee_user_id: user_id }] } })] : []),
        ...(has("university_coordinator") ? [prisma.university_coordinator.deleteMany({ where: { user_id } })] : []),
        ...(has("audit_log") ? [prisma.audit_log.deleteMany({ where: { user_id } })] : []),
        ...(has("user_logs") ? [prisma.user_logs.deleteMany({ where: { email } })] : []),
        ...(has("notification") ? [prisma.notification.deleteMany({ where: { user_id } })] : []),
        prisma.user_access.delete({ where: { user_id } }),
      ]);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to delete user", detail: message }, { status: 500 });
  }
}
