"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ApplicationData } from "@/core/hooks/useApplications";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
  withdrawn: "outline",
};

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

interface ApplicationDetailsDialogProps {
  application: ApplicationData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationDetailsDialog({
  application: app,
  open,
  onOpenChange,
}: ApplicationDetailsDialogProps) {
  if (!app) return null;

  const studentName =
    [app.student_profile.first_name, app.student_profile.last_name]
      .filter(Boolean)
      .join(" ") || "Unknown Student";

  const appliedDate = new Date(app.application_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const interviewDate = app.interview_date
    ? new Date(app.interview_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            Application Details
            <Badge variant={STATUS_VARIANTS[app.status] ?? "secondary"} className="capitalize text-xs font-normal">
              {app.status}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Applied on {appliedDate}</p>
        </DialogHeader>

        <Separator />

        <div className="space-y-5 pt-1">
          <Section title="Student">
            <Field label="Name" value={studentName} />
            <Field label="University" value={app.student_profile.university} />
            <Field label="Course" value={app.student_profile.course} />
          </Section>

          <Separator />

          <Section title="Job">
            <Field label="Position" value={app.job_post.position} />
            <Field label="Company" value={app.job_post.company_profile.name} />
            <Field label="Company Type" value={app.job_post.company_profile.company_type} />
            <Field label="Category" value={app.job_post.category} />
            <Field label="Work Setup" value={app.job_post.work_setup} />
            <Field label="Duration" value={app.job_post.duration} />
            <Field label="Hours / Week" value={app.job_post.hours_per_week} />
          </Section>

          {app.job_post.description && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Description</p>
                <p className="text-sm leading-relaxed line-clamp-4">{app.job_post.description}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cover Message</p>
            <p className="text-sm leading-relaxed">{app.message}</p>
          </div>

          {app.resume && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume</p>
                <a
                  href={app.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  View Resume
                </a>
              </div>
            </>
          )}

          {(interviewDate || app.meeting_link) && (
            <>
              <Separator />
              <Section title="Interview">
                <Field label="Scheduled Date" value={interviewDate} />
                {app.meeting_link && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Meeting Link</span>
                    <a
                      href={app.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      {app.meeting_link}
                    </a>
                  </div>
                )}
              </Section>
            </>
          )}

          {app.rejection_reason && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rejection Reason</p>
                <p className="text-sm leading-relaxed text-destructive">{app.rejection_reason}</p>
              </div>
            </>
          )}

          {app.notes && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
                <p className="text-sm leading-relaxed">{app.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
