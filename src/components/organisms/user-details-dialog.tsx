"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// ── Types ────────────────────────────────────────────────────────────────────

interface SelectedUser {
  user_id: string;
  email: string;
  type: string;
  is_verify: boolean;
}

interface StudentProfile {
  first_name?: string | null;
  last_name?: string | null;
  university?: string | null;
  course?: string | null;
  degree?: string | null;
  major?: string | null;
  level?: string | null;
  standing?: string | null;
  training_hours?: string | null;
  city?: string | null;
  phone_number?: string | null;
  about_me?: string | null;
  skills?: string | null;
  fb_link?: string | null;
  instagram_link?: string | null;
  linkedin_link?: string | null;
  portfolio_link?: string | null;
}

interface CompanyProfile {
  name?: string | null;
  company_type?: string | null;
  phone_number?: string | null;
  about_me?: string | null;
  address_line?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  fb_link?: string | null;
  instagram_link?: string | null;
  linkedin_link?: string | null;
  portfolio_link?: string | null;
}

interface UniversityProfile {
  university_name?: string | null;
  university_type?: string | null;
  admin_name?: string | null;
  department?: string | null;
  position?: string | null;
  phone_number?: string | null;
  about_me?: string | null;
  address_line?: string | null;
  state?: string | null;
  country?: string | null;
  fb_link?: string | null;
  instagram_link?: string | null;
  linkedin_link?: string | null;
  portfolio_link?: string | null;
}

type ProfileData = StudentProfile | CompanyProfile | UniversityProfile | null;

interface UserDetailsDialogProps {
  user: SelectedUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function LinkField({ label, href }: { label: string; href?: string | null }) {
  if (!href) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
        {href}
      </a>
    </div>
  );
}

// ── Profile renderers ─────────────────────────────────────────────────────────

function StudentDetails({ p }: { p: StudentProfile }) {
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || null;
  const hasLinks = p.fb_link || p.instagram_link || p.linkedin_link || p.portfolio_link;
  return (
    <div className="space-y-5">
      <Section title="Personal">
        <Field label="Full Name" value={name} />
        <Field label="Phone" value={p.phone_number} />
        <Field label="City" value={p.city} />
      </Section>
      <Separator />
      <Section title="Academic">
        <Field label="University" value={p.university} />
        <Field label="Course" value={p.course} />
        <Field label="Degree" value={p.degree} />
        <Field label="Major" value={p.major} />
        <Field label="Level" value={p.level} />
        <Field label="Standing" value={p.standing} />
        <Field label="Training Hours" value={p.training_hours} />
      </Section>
      {p.skills && (
        <>
          <Separator />
          <Section title="Skills">
            <div className="col-span-2 flex flex-wrap gap-1.5">
              {p.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </Section>
        </>
      )}
      {p.about_me && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</p>
            <p className="text-sm leading-relaxed">{p.about_me}</p>
          </div>
        </>
      )}
      {hasLinks && (
        <>
          <Separator />
          <Section title="Links">
            <LinkField label="Facebook" href={p.fb_link} />
            <LinkField label="Instagram" href={p.instagram_link} />
            <LinkField label="LinkedIn" href={p.linkedin_link} />
            <LinkField label="Portfolio" href={p.portfolio_link} />
          </Section>
        </>
      )}
    </div>
  );
}

function CompanyDetails({ p }: { p: CompanyProfile }) {
  const location = [p.city, p.state, p.country].filter(Boolean).join(", ") || null;
  const hasLinks = p.fb_link || p.instagram_link || p.linkedin_link || p.portfolio_link;
  return (
    <div className="space-y-5">
      <Section title="Company">
        <Field label="Name" value={p.name} />
        <Field label="Type" value={p.company_type} />
        <Field label="Phone" value={p.phone_number} />
        <Field label="Address" value={p.address_line} />
        <Field label="Location" value={location} />
      </Section>
      {p.about_me && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</p>
            <p className="text-sm leading-relaxed">{p.about_me}</p>
          </div>
        </>
      )}
      {hasLinks && (
        <>
          <Separator />
          <Section title="Links">
            <LinkField label="Facebook" href={p.fb_link} />
            <LinkField label="Instagram" href={p.instagram_link} />
            <LinkField label="LinkedIn" href={p.linkedin_link} />
            <LinkField label="Portfolio" href={p.portfolio_link} />
          </Section>
        </>
      )}
    </div>
  );
}

function UniversityDetails({ p }: { p: UniversityProfile }) {
  const location = [p.state, p.country].filter(Boolean).join(", ") || null;
  const hasLinks = p.fb_link || p.instagram_link || p.linkedin_link || p.portfolio_link;
  return (
    <div className="space-y-5">
      <Section title="Institution">
        <Field label="University Name" value={p.university_name} />
        <Field label="Type" value={p.university_type} />
        <Field label="Address" value={p.address_line} />
        <Field label="Location" value={location} />
        <Field label="Phone" value={p.phone_number} />
      </Section>
      <Separator />
      <Section title="Representative">
        <Field label="Admin Name" value={p.admin_name} />
        <Field label="Department" value={p.department} />
        <Field label="Position" value={p.position} />
      </Section>
      {p.about_me && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</p>
            <p className="text-sm leading-relaxed">{p.about_me}</p>
          </div>
        </>
      )}
      {hasLinks && (
        <>
          <Separator />
          <Section title="Links">
            <LinkField label="Facebook" href={p.fb_link} />
            <LinkField label="Instagram" href={p.instagram_link} />
            <LinkField label="LinkedIn" href={p.linkedin_link} />
            <LinkField label="Portfolio" href={p.portfolio_link} />
          </Section>
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-48" />
        </div>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const [profile, setProfile] = useState<ProfileData>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    setProfile(null);
    setError(null);
    setLoading(true);

    fetch("/api/user/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, type: user.type }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success") setProfile(res.data);
        else setError("Failed to load profile.");
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [open, user]);

  const typeLabel = user?.type
    ? user.type.charAt(0).toUpperCase() + user.type.slice(1)
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {typeLabel} Profile
            <Badge variant={user?.is_verify ? "default" : "secondary"} className="text-xs font-normal">
              {user?.is_verify ? "Verified" : "Pending"}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </DialogHeader>

        <Separator />

        <div className="pt-1">
          {loading && <LoadingSkeleton />}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!loading && !error && profile === null && (
            <p className="text-sm text-muted-foreground">No profile data found for this user.</p>
          )}
          {!loading && !error && profile !== null && (
            <>
              {user?.type === "student" && <StudentDetails p={profile as StudentProfile} />}
              {user?.type === "company" && <CompanyDetails p={profile as CompanyProfile} />}
              {user?.type === "university" && <UniversityDetails p={profile as UniversityProfile} />}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
