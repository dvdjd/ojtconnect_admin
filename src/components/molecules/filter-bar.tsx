"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const TYPE_LABELS: Record<string, string> = {
  all: "All types",
  student: "Student",
  company: "Company",
  university: "University",
};

const STATUS_LABELS: Record<string, string> = {
  all: "All status",
  true: "Verified",
  false: "Pending",
};

interface FilterBarProps {
  email: string;
  type: string;
  isVerify: string;
  onEmailChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onVerifyChange: (v: string) => void;
}

export function FilterBar({
  email,
  type,
  isVerify,
  onEmailChange,
  onTypeChange,
  onVerifyChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-email">Email</Label>
        <Input
          id="filter-email"
          placeholder="Search by email…"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>User Type</Label>
        <Select value={type} onValueChange={(v) => onTypeChange(v ?? "all")}>
          <SelectTrigger className="w-40">
            <span className="text-sm">{TYPE_LABELS[type] ?? "All types"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="university">University</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Status</Label>
        <Select value={isVerify} onValueChange={(v) => onVerifyChange(v ?? "all")}>
          <SelectTrigger className="w-40">
            <span className="text-sm">{STATUS_LABELS[isVerify] ?? "All status"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
