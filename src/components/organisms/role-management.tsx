"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminRole {
  id: number;
  name: string;
  slug: string;
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get<{ data: AdminRole[] }>("/api/roles")
      .then((res) => { if (res.data) setRoles(res.data); })
      .catch(() => setError("Failed to load roles."))
      .finally(() => setLoading(false));
  }, []);

  const toSlug = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

  const addRole = async () => {
    const name = newName.trim();
    if (!name) return;
    const slug = toSlug(name);
    setAdding(true);
    setError(null);
    try {
      const res = await api.post<{ data: AdminRole; status: string }>("/api/roles", { name, slug });
      if (res.status === "success" && res.data) {
        setRoles((prev) => [...prev, res.data]);
        setNewName("");
      }
    } catch {
      setError("Failed to add role. Slug may already exist.");
    } finally {
      setAdding(false);
    }
  };

  const deleteRole = async (id: number) => {
    try {
      await api.delete("/api/roles", { id });
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete role.");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">Roles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <span className="text-sm font-medium">{role.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground font-mono">{role.slug}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 hover:bg-destructive hover:text-white hover:border-destructive"
                  onClick={() => deleteRole(role.id)}
                  title="Delete role"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Role name (e.g. Support)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRole()}
            className="flex-1"
          />
          <Button onClick={addRole} disabled={adding || !newName.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {newName.trim() && (
          <p className="text-xs text-muted-foreground">
            Slug: <span className="font-mono">{toSlug(newName)}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
