"use client";

import { useEffect, useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// ── Types ─────────────────────────────────────────────────────────────────────

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

type ProfileData = StudentProfile | CompanyProfile | UniversityProfile;

interface UserDetailsDialogProps {
  user: SelectedUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── View helpers ──────────────────────────────────────────────────────────────

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

// ── Edit helpers ──────────────────────────────────────────────────────────────

function EditField({
  label, name, value, onChange, textarea,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, val: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      {textarea ? (
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(name, e.target.value)} />
      )}
    </div>
  );
}

function EditSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function EditFullField({
  label, name, value, onChange, textarea,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, val: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className="col-span-2">
      <EditField label={label} name={name} value={value} onChange={onChange} textarea={textarea} />
    </div>
  );
}

// ── View renderers ────────────────────────────────────────────────────────────

function StudentView({ p }: { p: StudentProfile }) {
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

function CompanyView({ p }: { p: CompanyProfile }) {
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

function UniversityView({ p }: { p: UniversityProfile }) {
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

// ── Edit renderers ────────────────────────────────────────────────────────────

function StudentEdit({ form, onChange }: { form: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <EditSection title="Personal">
        <EditField label="First Name" name="first_name" value={form.first_name} onChange={onChange} />
        <EditField label="Last Name" name="last_name" value={form.last_name} onChange={onChange} />
        <EditField label="Phone" name="phone_number" value={form.phone_number} onChange={onChange} />
        <EditField label="City" name="city" value={form.city} onChange={onChange} />
      </EditSection>
      <Separator />
      <EditSection title="Academic">
        <EditFullField label="University" name="university" value={form.university} onChange={onChange} />
        <EditField label="Course" name="course" value={form.course} onChange={onChange} />
        <EditField label="Degree" name="degree" value={form.degree} onChange={onChange} />
        <EditField label="Major" name="major" value={form.major} onChange={onChange} />
        <EditField label="Level" name="level" value={form.level} onChange={onChange} />
        <EditField label="Standing" name="standing" value={form.standing} onChange={onChange} />
        <EditField label="Training Hours" name="training_hours" value={form.training_hours} onChange={onChange} />
      </EditSection>
      <Separator />
      <EditSection title="About & Skills">
        <EditFullField label="About Me" name="about_me" value={form.about_me} onChange={onChange} textarea />
        <EditFullField label="Skills (comma separated)" name="skills" value={form.skills} onChange={onChange} />
      </EditSection>
      <Separator />
      <EditSection title="Links">
        <EditField label="Facebook" name="fb_link" value={form.fb_link} onChange={onChange} />
        <EditField label="Instagram" name="instagram_link" value={form.instagram_link} onChange={onChange} />
        <EditField label="LinkedIn" name="linkedin_link" value={form.linkedin_link} onChange={onChange} />
        <EditField label="Portfolio" name="portfolio_link" value={form.portfolio_link} onChange={onChange} />
      </EditSection>
    </div>
  );
}

function CompanyEdit({ form, onChange }: { form: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <EditSection title="Company">
        <EditField label="Company Name" name="name" value={form.name} onChange={onChange} />
        <EditField label="Type" name="company_type" value={form.company_type} onChange={onChange} />
        <EditField label="Phone" name="phone_number" value={form.phone_number} onChange={onChange} />
        <EditFullField label="Address" name="address_line" value={form.address_line} onChange={onChange} />
        <EditField label="City" name="city" value={form.city} onChange={onChange} />
        <EditField label="State" name="state" value={form.state} onChange={onChange} />
        <EditField label="Country" name="country" value={form.country} onChange={onChange} />
      </EditSection>
      <Separator />
      <EditSection title="About">
        <EditFullField label="About" name="about_me" value={form.about_me} onChange={onChange} textarea />
      </EditSection>
      <Separator />
      <EditSection title="Links">
        <EditField label="Facebook" name="fb_link" value={form.fb_link} onChange={onChange} />
        <EditField label="Instagram" name="instagram_link" value={form.instagram_link} onChange={onChange} />
        <EditField label="LinkedIn" name="linkedin_link" value={form.linkedin_link} onChange={onChange} />
        <EditField label="Portfolio" name="portfolio_link" value={form.portfolio_link} onChange={onChange} />
      </EditSection>
    </div>
  );
}

function UniversityEdit({ form, onChange }: { form: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <EditSection title="Institution">
        <EditField label="University Name" name="university_name" value={form.university_name} onChange={onChange} />
        <EditField label="Type" name="university_type" value={form.university_type} onChange={onChange} />
        <EditFullField label="Address" name="address_line" value={form.address_line} onChange={onChange} />
        <EditField label="State" name="state" value={form.state} onChange={onChange} />
        <EditField label="Country" name="country" value={form.country} onChange={onChange} />
        <EditField label="Phone" name="phone_number" value={form.phone_number} onChange={onChange} />
      </EditSection>
      <Separator />
      <EditSection title="Representative">
        <EditField label="Admin Name" name="admin_name" value={form.admin_name} onChange={onChange} />
        <EditField label="Department" name="department" value={form.department} onChange={onChange} />
        <EditField label="Position" name="position" value={form.position} onChange={onChange} />
      </EditSection>
      <Separator />
      <EditSection title="About">
        <EditFullField label="About" name="about_me" value={form.about_me} onChange={onChange} textarea />
      </EditSection>
      <Separator />
      <EditSection title="Links">
        <EditField label="Facebook" name="fb_link" value={form.fb_link} onChange={onChange} />
        <EditField label="Instagram" name="instagram_link" value={form.instagram_link} onChange={onChange} />
        <EditField label="LinkedIn" name="linkedin_link" value={form.linkedin_link} onChange={onChange} />
        <EditField label="Portfolio" name="portfolio_link" value={form.portfolio_link} onChange={onChange} />
      </EditSection>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function toForm(profile: ProfileData): Record<string, string> {
  return Object.fromEntries(
    Object.entries(profile).map(([k, v]) => [k, v ?? ""])
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    setProfile(null);
    setError(null);
    setEditing(false);
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

  const handleEdit = () => {
    setForm(profile ? toForm(profile) : {});
    setSaveError(null);
    setEditing(true);
  };

  const handleChange = (key: string, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/user/details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, type: user.type, data: form }),
      });
      const json = await res.json();
      if (json.status === "success") {
        setProfile(json.data);
        setEditing(false);
      } else {
        setSaveError("Failed to save changes.");
      }
    } catch {
      setSaveError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = user?.type
    ? user.type.charAt(0).toUpperCase() + user.type.slice(1)
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{typeLabel} Profile</DialogTitle>
            <Badge variant={user?.is_verify ? "default" : "secondary"} className="text-xs font-normal">
              {user?.is_verify ? "Verified" : "Pending"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </DialogHeader>

        <Separator />

        <div className="pt-1">
          {loading && <LoadingSkeleton />}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}

          {!loading && !error && profile === null && !editing && (
            <p className="text-sm text-muted-foreground">No profile data found for this user.</p>
          )}

          {!loading && !error && !editing && profile !== null && (
            <>
              {user?.type === "student" && <StudentView p={profile as StudentProfile} />}
              {user?.type === "company" && <CompanyView p={profile as CompanyProfile} />}
              {user?.type === "university" && <UniversityView p={profile as UniversityProfile} />}
            </>
          )}

          {editing && (
            <>
              {user?.type === "student" && <StudentEdit form={form} onChange={handleChange} />}
              {user?.type === "company" && <CompanyEdit form={form} onChange={handleChange} />}
              {user?.type === "university" && <UniversityEdit form={form} onChange={handleChange} />}
            </>
          )}
        </div>

        <DialogFooter>
          {!loading && !editing && (
            <Button size="sm" variant="outline" onClick={handleEdit}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit Profile
            </Button>
          )}
          {editing && (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Check className="h-3.5 w-3.5 mr-1" />
                {saving ? "Saving…" : "Save"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
