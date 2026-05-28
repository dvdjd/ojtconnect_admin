import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

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

        const jobs = await prisma.job_post.findMany({
          where: { company_id },
          select: { job_id: true },
        });
        const job_ids = jobs.map((j) => j.job_id);

        const applications = await prisma.application.findMany({
          where: { job_id: { in: job_ids } },
          select: { application_id: true },
        });
        const application_ids = applications.map((a) => a.application_id);

        const placements = await prisma.student_placement.findMany({
          where: { company_id },
          select: { placement_id: true },
        });
        const placement_ids = placements.map((p) => p.placement_id);

        const ojtRecords = await prisma.ojt_tracking.findMany({
          where: { job_id: { in: job_ids } },
          select: { ojt_tracking_id: true },
        });
        const ojt_ids = ojtRecords.map((o) => o.ojt_tracking_id);

        await prisma.$transaction([
          prisma.student_evaluation.deleteMany({
            where: { placement_id: { in: placement_ids } },
          }),
          prisma.student_evaluation.deleteMany({
            where: {
              OR: [
                { evaluator_user_id: user_id },
                { evaluatee_user_id: user_id },
              ],
            },
          }),
          prisma.employer_feedback.deleteMany({ where: { company_id } }),
          prisma.feedback_draft.deleteMany({ where: { company_id } }),
          prisma.student_placement.deleteMany({ where: { company_id } }),
          prisma.interview_schedule.deleteMany({
            where: { application_id: { in: application_ids } },
          }),
          prisma.application.deleteMany({
            where: { job_id: { in: job_ids } },
          }),
          prisma.bookmark.deleteMany({ where: { job_id: { in: job_ids } } }),
          prisma.job_requirement.deleteMany({
            where: { job_id: { in: job_ids } },
          }),
          prisma.job_skill_requirement.deleteMany({
            where: { job_id: { in: job_ids } },
          }),
          prisma.daily_time_record.deleteMany({
            where: { ojt_tracking_id: { in: ojt_ids } },
          }),
          prisma.ojt_tracking.deleteMany({
            where: { job_id: { in: job_ids } },
          }),
          prisma.employer_subscription.deleteMany({ where: { company_id } }),
          prisma.company_profile.delete({ where: { company_id } }),
          prisma.university_coordinator.deleteMany({ where: { user_id } }),
          prisma.audit_log.deleteMany({ where: { user_id } }),
          prisma.user_logs.deleteMany({ where: { email } }),
          prisma.notification.deleteMany({ where: { user_id } }),
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

        const applications = await prisma.application.findMany({
          where: { student_id },
          select: { application_id: true },
        });
        const application_ids = applications.map((a) => a.application_id);

        const placements = await prisma.student_placement.findMany({
          where: { student_id },
          select: { placement_id: true },
        });
        const placement_ids = placements.map((p) => p.placement_id);

        const ojtRecords = await prisma.ojt_tracking.findMany({
          where: { student_id },
          select: { ojt_tracking_id: true },
        });
        const ojt_ids = ojtRecords.map((o) => o.ojt_tracking_id);

        await prisma.$transaction([
          prisma.student_evaluation.deleteMany({
            where: { placement_id: { in: placement_ids } },
          }),
          prisma.student_evaluation.deleteMany({
            where: {
              OR: [
                { evaluator_user_id: user_id },
                { evaluatee_user_id: user_id },
              ],
            },
          }),
          prisma.employer_feedback.deleteMany({ where: { student_id } }),
          prisma.feedback_draft.deleteMany({ where: { student_id } }),
          prisma.student_placement.deleteMany({ where: { student_id } }),
          prisma.interview_schedule.deleteMany({
            where: { application_id: { in: application_ids } },
          }),
          prisma.application.deleteMany({ where: { student_id } }),
          prisma.bookmark.deleteMany({ where: { student_id } }),
          prisma.daily_time_record.deleteMany({
            where: { ojt_tracking_id: { in: ojt_ids } },
          }),
          prisma.ojt_tracking.deleteMany({ where: { student_id } }),
          prisma.resume_education.deleteMany({ where: { student_id } }),
          prisma.resume_experience.deleteMany({ where: { student_id } }),
          prisma.resume_skills.deleteMany({ where: { student_id } }),
          prisma.student_document.deleteMany({ where: { student_id } }),
          prisma.student_resume.deleteMany({ where: { student_id } }),
          prisma.student_skill.deleteMany({ where: { student_id } }),
          prisma.student_profile.delete({ where: { student_id } }),
          prisma.university_coordinator.deleteMany({ where: { user_id } }),
          prisma.audit_log.deleteMany({ where: { user_id } }),
          prisma.user_logs.deleteMany({ where: { email } }),
          prisma.notification.deleteMany({ where: { user_id } }),
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

        const departments = await prisma.university_department.findMany({
          where: { university_id },
          select: { department_id: true },
        });
        const department_ids = departments.map((d) => d.department_id);

        const subscriptions = await prisma.university_subscription.findMany({
          where: { university_id },
          select: { subscription_id: true },
        });
        const subscription_ids = subscriptions.map((s) => s.subscription_id);

        const ojtRecords = await prisma.ojt_tracking.findMany({
          where: { university_id },
          select: { ojt_tracking_id: true },
        });
        const ojt_ids = ojtRecords.map((o) => o.ojt_tracking_id);

        await prisma.$transaction([
          prisma.student_evaluation.deleteMany({
            where: {
              OR: [
                { evaluator_user_id: user_id },
                { evaluatee_user_id: user_id },
              ],
            },
          }),
          prisma.daily_time_record.deleteMany({
            where: { ojt_tracking_id: { in: ojt_ids } },
          }),
          prisma.ojt_tracking.deleteMany({ where: { university_id } }),
          prisma.billing_history.deleteMany({
            where: { subscription_id: { in: subscription_ids } },
          }),
          prisma.university_subscription.deleteMany({ where: { university_id } }),
          prisma.university_course.deleteMany({
            where: { department_id: { in: department_ids } },
          }),
          prisma.university_department.deleteMany({ where: { university_id } }),
          prisma.university_analytics_snapshot.deleteMany({
            where: { university_id },
          }),
          prisma.university_coordinator.deleteMany({ where: { university_id } }),
          prisma.university_profile.delete({ where: { university_id } }),
          prisma.audit_log.deleteMany({ where: { user_id } }),
          prisma.user_logs.deleteMany({ where: { email } }),
          prisma.notification.deleteMany({ where: { user_id } }),
          prisma.user_access.delete({ where: { user_id } }),
        ]);
      }
    } else {
      // Fallback for unknown types — delete common records only
      await prisma.$transaction([
        prisma.student_evaluation.deleteMany({
          where: {
            OR: [
              { evaluator_user_id: user_id },
              { evaluatee_user_id: user_id },
            ],
          },
        }),
        prisma.university_coordinator.deleteMany({ where: { user_id } }),
        prisma.audit_log.deleteMany({ where: { user_id } }),
        prisma.user_logs.deleteMany({ where: { email } }),
        prisma.notification.deleteMany({ where: { user_id } }),
        prisma.user_access.delete({ where: { user_id } }),
      ]);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
