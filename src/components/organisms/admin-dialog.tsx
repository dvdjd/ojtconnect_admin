"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IAdmin } from "@/core/hooks/useAdmin";
import { api } from "@/lib/utils/api";

interface AdminRole {
  id: number;
  name: string;
  slug: string;
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin?: IAdmin | null;
  onSave: (username: string, password: string, role: string) => Promise<void>;
}

export function AdminDialog({ open, onOpenChange, admin, onSave }: AdminDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ data: AdminRole[]; status: string }>("/api/roles").then((res) => {
      if (res.status === "success" && res.data) {
        setRoles(res.data);
        if (!role) setRole(res.data[0]?.slug ?? "");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      setUsername(admin?.username ?? "");
      setPassword("");
      setRole(admin?.role ?? roles[0]?.slug ?? "");
      setError(null);
    }
  }, [open, admin, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return setError("Username is required.");
    if (!admin && !password.trim()) return setError("Password is required.");
    setSaving(true);
    setError(null);
    try {
      await onSave(username.trim(), password, role);
      onOpenChange(false);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = roles.find((r) => r.slug === role)?.name ?? "Select role";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{admin ? "Edit Admin" : "Add Admin"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-username">Username</Label>
            <Input
              id="admin-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-password">
              Password{" "}
              {admin && (
                <span className="text-muted-foreground">(leave blank to keep current)</span>
              )}
            </Label>
            <div className="flex gap-2">
              <Input
                id="admin-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={admin ? "New password (optional)" : "Enter password"}
                autoComplete="new-password"
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPassword(generatePassword())}
                title="Generate random password"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => v && setRole(v)}>
              <SelectTrigger>
                <span className="text-sm">{roleLabel}</span>
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.slug} value={r.slug}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
