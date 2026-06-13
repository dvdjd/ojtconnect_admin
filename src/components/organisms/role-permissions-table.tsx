"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

interface Permission {
  id: number;
  role_slug: string;
  route: string;
}

interface NavRoute {
  id: number;
  label: string;
  route: string;
  icon: string;
  sort_order: number;
}

export default function RolePermissionsTable() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [navRoutes, setNavRoutes] = useState<NavRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // new route form
  const [newLabel, setNewLabel] = useState("");
  const [newRoute, setNewRoute] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<{ data: AdminRole[] }>("/api/roles"),
      api.get<{ data: Permission[] }>("/api/roles/permissions"),
      api.get<{ data: NavRoute[] }>("/api/nav-routes"),
    ]).then(([r, p, n]) => {
      if (r.data) setRoles(r.data);
      if (p.data) setPermissions(p.data);
      if (n.data) setNavRoutes(n.data);
    }).catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, []);

  const hasPermission = (role_slug: string, route: string) =>
    permissions.some((p) => p.role_slug === role_slug && p.route === route);

  const toggle = async (role_slug: string, route: string) => {
    const allowed = hasPermission(role_slug, route);
    try {
      if (allowed) {
        await api.delete("/api/roles/permissions", { role_slug, route });
        setPermissions((prev) => prev.filter((p) => !(p.role_slug === role_slug && p.route === route)));
        toast.success("Permission removed.");
      } else {
        const res = await api.post<{ data: Permission; status: string }>("/api/roles/permissions", { role_slug, route });
        if (res.status === "success" && res.data) {
          setPermissions((prev) => [...prev, res.data]);
          toast.success("Permission granted.");
        }
      }
    } catch {
      toast.error("Failed to update permission.");
    }
  };

  const addRoute = async () => {
    if (!newLabel.trim() || !newRoute.trim()) return;
    setAdding(true);
    try {
      const res = await api.post<{ data: NavRoute; status: string }>("/api/nav-routes", {
        label: newLabel.trim(),
        route: newRoute.trim().startsWith("/") ? newRoute.trim() : `/${newRoute.trim()}`,
        icon: newIcon.trim() || "Circle",
        sort_order: navRoutes.length,
      });
      if (res.status === "success" && res.data) {
        setNavRoutes((prev) => [...prev, res.data]);
        setNewLabel("");
        setNewRoute("");
        setNewIcon("");
        toast.success("Route added successfully.");
      }
    } catch {
      toast.error("Failed to add route.");
    } finally {
      setAdding(false);
    }
  };

  const moveRoute = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= navRoutes.length) return;

    const itemA = navRoutes[index];
    const itemB = navRoutes[swapIndex];

    // Reassign sort_orders: give each item the other's sort_order value.
    // If they happen to be equal, assign positional values to force a difference.
    const orderA = itemB.sort_order !== itemA.sort_order
      ? itemB.sort_order
      : swapIndex;
    const orderB = itemB.sort_order !== itemA.sort_order
      ? itemA.sort_order
      : index;

    const updated = navRoutes.map((r) => {
      if (r.id === itemA.id) return { ...r, sort_order: orderA };
      if (r.id === itemB.id) return { ...r, sort_order: orderB };
      return r;
    });

    // Re-sort by new sort_order so the row moves visually
    updated.sort((a, b) => a.sort_order - b.sort_order);
    setNavRoutes(updated);

    try {
      await api.patch("/api/nav-routes", [
        { id: itemA.id, sort_order: orderA },
        { id: itemB.id, sort_order: orderB },
      ]);
    } catch {
      toast.error("Failed to update order.");
      setNavRoutes(navRoutes);
    }
  };

  const deleteRoute = async (id: number) => {
    try {
      await api.delete("/api/nav-routes", { id });
      setNavRoutes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Route deleted.");
    } catch {
      toast.error("Failed to delete route.");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">Route Permissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : (
          <>
            {/* Permissions matrix */}
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Route</th>
                    {roles.map((r) => (
                      <th key={r.slug} className="text-center py-2.5 px-4 font-medium text-muted-foreground">
                        {r.name}
                      </th>
                    ))}
                    <th className="py-2.5 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {navRoutes.map((nav, index) => (
                    <tr key={nav.route} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">
                        <div className="flex flex-col">
                          <span>{nav.label}</span>
                          <span className="text-xs text-muted-foreground font-mono">{nav.route}</span>
                        </div>
                      </td>
                      {roles.map((r) => (
                        <td key={r.slug} className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer accent-primary"
                            checked={hasPermission(r.slug, nav.route)}
                            onChange={() => toggle(r.slug, nav.route)}
                          />
                        </td>
                      ))}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveRoute(index, "up")}
                            disabled={index === 0}
                            title="Move up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveRoute(index, "down")}
                            disabled={index === navRoutes.length - 1}
                            title="Move down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 hover:bg-destructive hover:text-white hover:border-destructive"
                            onClick={() => deleteRoute(nav.id)}
                            title="Remove route"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add new route */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Add Route</p>
              <div className="flex gap-2 flex-wrap">
                <Input
                  placeholder="Label (e.g. Reports)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-40"
                />
                <Input
                  placeholder="Route (e.g. /reports)"
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
                  className="w-48"
                />
                <Input
                  placeholder="Icon (e.g. BarChart)"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-40"
                />
                <Button onClick={addRoute} disabled={adding || !newLabel.trim() || !newRoute.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Any Lucide icon name (PascalCase) — e.g. LayoutDashboard, Users, FileText, ShieldCheck, Settings, BarChart, Bell, Briefcase, Building, GraduationCap, CreditCard, Calendar, ClipboardList, Globe, Inbox, Mail, MessageSquare, Package, PieChart, Star, Wallet, Zap…
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
