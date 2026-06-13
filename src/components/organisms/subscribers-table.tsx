"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, ArrowUp, ArrowDown, Trash2, MoreHorizontal, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { PaginationControls } from "@/components/molecules/pagination-controls";
import { AddUniversitySubscriptionDialog } from "@/components/organisms/add-university-subscription-dialog";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Subscriber {
  subscription_id: string;
  type: "company" | "university";
  name: string;
  plan_id: string;
  plan_name: string;
  plan_type: string;
  price_monthly: number;
  billing_cycle: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  date_created: string;
}

interface Plan {
  plan_id: string;
  plan_name: string;
  price_monthly: number;
}

type ActionKind = "upgrade" | "downgrade" | "renew" | "remove";

interface PendingAction {
  kind: ActionKind;
  subscription: Subscriber;
  targetPlan?: Plan;
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  cancelled: "destructive",
  expired: "destructive",
  trial: "secondary",
  inactive: "outline",
};

const PLAN_ORDER = ["starter", "plus", "pro"];

const PAGE_SIZE = 10;

export default function SubscribersTable() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{ id: string; top: number; left: number } | null>(null);

  // Fetch university plans once
  useEffect(() => {
    api.get<{ plans: Plan[]; status: string }>("/api/subscribers/university").then((res) => {
      if (res.status === "success") {
        setPlans(
          [...(res.plans ?? [])].sort(
            (a, b) =>
              PLAN_ORDER.indexOf(a.plan_name.toLowerCase()) -
              PLAN_ORDER.indexOf(b.plan_name.toLowerCase())
          )
        );
      }
    });
  }, []);

  // Close on outside click or scroll
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-action-menu]')) {
        setOpenMenu(null);
      }
    };
    const handleScroll = () => setOpenMenu(null);
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const fetchSubscribers = useCallback(
    async (mounted: boolean) => {
      setLoading(true);
      try {
        const res = await api.post<{ data: Subscriber[]; total: number; status: string }>(
          "/api/subscribers",
          {
            filters: {
              name: nameFilter || undefined,
              status: statusFilter !== "all" ? statusFilter : undefined,
              type: typeFilter !== "all" ? typeFilter : undefined,
            },
            page,
            pageSize: PAGE_SIZE,
          }
        );
        if (mounted && res.status === "success") {
          setSubscribers(res.data ?? []);
          setTotal(res.total ?? 0);
        }
      } catch {
        if (mounted) setError("Failed to fetch subscribers");
      } finally {
        if (mounted) setLoading(false);
      }
    },
    [nameFilter, statusFilter, typeFilter, page]
  );

  useEffect(() => {
    let mounted = true;
    fetchSubscribers(mounted);
    return () => { mounted = false; };
  }, [fetchSubscribers]);

  const handleFilterChange = (update: { name?: string; status?: string; type?: string }) => {
    if (update.name !== undefined) setNameFilter(update.name);
    if (update.status !== undefined) setStatusFilter(update.status);
    if (update.type !== undefined) setTypeFilter(update.type);
    setPage(1);
  };

  const fmt = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const getAdjacentPlan = (currentPlanId: string, direction: "upgrade" | "downgrade") => {
    const idx = plans.findIndex((p) => p.plan_id === currentPlanId);
    if (idx === -1) return null;
    const target = direction === "upgrade" ? plans[idx + 1] : plans[idx - 1];
    return target ?? null;
  };

  const openAction = (kind: ActionKind, sub: Subscriber) => {
    setOpenMenu(null);
    if (kind === "remove" || kind === "renew") {
      setPendingAction({ kind, subscription: sub });
      return;
    }
    const target = getAdjacentPlan(sub.plan_id, kind);
    if (!target) return;
    setPendingAction({ kind, subscription: sub, targetPlan: target });
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      const { kind, subscription, targetPlan } = pendingAction;

      if (kind === "remove") {
        const res = await api.delete<{ status: string; error?: string }>(
          "/api/subscribers/university",
          { subscription_id: subscription.subscription_id }
        );
        if (res.status === "success") {
          toast.success(`${subscription.name}'s subscription removed.`);
          fetchSubscribers(true);
        } else {
          toast.error(res.error ?? "Failed to remove subscription.");
        }
      } else if (kind === "renew") {
        const res = await api.patch<{ status: string; error?: string }>(
          "/api/subscribers/university",
          { subscription_id: subscription.subscription_id, renew: true }
        );
        if (res.status === "success") {
          toast.success(`${subscription.name}'s subscription renewed.`);
          fetchSubscribers(true);
        } else {
          toast.error(res.error ?? "Failed to renew subscription.");
        }
      } else {
        const res = await api.patch<{ status: string; error?: string }>(
          "/api/subscribers/university",
          { subscription_id: subscription.subscription_id, plan_id: targetPlan!.plan_id }
        );
        if (res.status === "success") {
          toast.success(
            `${subscription.name} ${kind === "upgrade" ? "upgraded" : "downgraded"} to ${targetPlan!.plan_name}.`
          );
          fetchSubscribers(true);
        } else {
          toast.error(res.error ?? "Failed to update subscription.");
        }
      }
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Subscribers</CardTitle>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add University Subscription
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-name">Name</Label>
            <Input
              id="filter-name"
              placeholder="Search by name…"
              value={nameFilter}
              onChange={(e) => handleFilterChange({ name: e.target.value })}
              className="w-56"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={typeFilter} onValueChange={(v) => handleFilterChange({ type: v ?? "all" })}>
              <SelectTrigger className="w-36">
                <span className="text-sm capitalize">{typeFilter === "all" ? "All types" : typeFilter}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="university">University</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={(v) => handleFilterChange({ status: v ?? "all" })}>
              <SelectTrigger className="w-36">
                <span className="text-sm capitalize">{statusFilter === "all" ? "All status" : statusFilter}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No subscribers found.
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((s) => {
                  const planIdx = PLAN_ORDER.indexOf(s.plan_name.toLowerCase());
                  const canUpgrade = s.type === "university" && planIdx < PLAN_ORDER.length - 1 && planIdx !== -1;
                  const canDowngrade = s.type === "university" && planIdx > 0;

                  return (
                    <TableRow key={s.subscription_id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="text-sm font-semibold uppercase tracking-wide cursor-default">
                              {s.plan_name}
                            </TooltipTrigger>
                            <TooltipContent>
                              ₱{s.price_monthly.toLocaleString("en-PH")}/mo
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{s.billing_cycle}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[s.status] ?? "secondary"} className="capitalize text-xs">
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmt(s.current_period_start)} – {fmt(s.current_period_end)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmt(s.date_created)}
                      </TableCell>
                      <TableCell>
                        {s.type === "university" && (
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                if (openMenu?.id === s.subscription_id) {
                                  setOpenMenu(null);
                                } else {
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  const dropdownHeight = 180;
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const top = spaceBelow < dropdownHeight
                                    ? rect.top - dropdownHeight - 4
                                    : rect.bottom + 4;
                                  setOpenMenu({ id: s.subscription_id, top, left: rect.right - 208 });
                                }
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <PaginationControls
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </CardContent>

      <AddUniversitySubscriptionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => fetchSubscribers(true)}
      />

      {/* Action dropdown portal */}
      {openMenu && typeof document !== "undefined" && (() => {
        const sub = subscribers.find((s) => s.subscription_id === openMenu.id);
        if (!sub) return null;
        const planIdx = PLAN_ORDER.indexOf(sub.plan_name.toLowerCase());
        const canUpgrade = planIdx < PLAN_ORDER.length - 1 && planIdx !== -1;
        const canDowngrade = planIdx > 0;
        return createPortal(
          <div
            data-action-menu
            style={{ position: "fixed", top: openMenu.top, left: openMenu.left, zIndex: 9999 }}
            className="w-52 rounded-md border bg-popover shadow-md px-1 py-1"
          >
            <button
              disabled={!canUpgrade}
              onClick={() => openAction("upgrade", sub)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
            >
              <ArrowUp className="h-4 w-4" />
              Upgrade Plan
            </button>
            <button
              disabled={!canDowngrade}
              onClick={() => openAction("downgrade", sub)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
            >
              <ArrowDown className="h-4 w-4" />
              Downgrade Plan
            </button>
            <button
              onClick={() => openAction("renew", sub)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Renew Subscription
            </button>
            <div className="my-1 border-t" />
            <button
              onClick={() => openAction("remove", sub)}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm"
            >
              <Trash2 style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
              Remove Subscription
            </button>
          </div>,
          document.body
        );
      })()}

      {/* Confirmation dialog */}
      <Dialog open={!!pendingAction} onOpenChange={(o) => { if (!o) setPendingAction(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.kind === "upgrade" && "Upgrade Plan"}
              {pendingAction?.kind === "downgrade" && "Downgrade Plan"}
              {pendingAction?.kind === "renew" && "Renew Subscription"}
              {pendingAction?.kind === "remove" && "Remove Subscription"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction?.kind === "upgrade" && (
                <>
                  Upgrade <strong>{pendingAction.subscription.name}</strong> from{" "}
                  <strong className="capitalize">{pendingAction.subscription.plan_name}</strong> to{" "}
                  <strong className="capitalize">{pendingAction.targetPlan?.plan_name}</strong>?
                </>
              )}
              {pendingAction?.kind === "downgrade" && (
                <>
                  Downgrade <strong>{pendingAction.subscription.name}</strong> from{" "}
                  <strong className="capitalize">{pendingAction.subscription.plan_name}</strong> to{" "}
                  <strong className="capitalize">{pendingAction.targetPlan?.plan_name}</strong>?
                </>
              )}
              {pendingAction?.kind === "renew" && (
                <>
                  Renew <strong>{pendingAction.subscription.name}</strong>&apos;s subscription? The period
                  will be extended by one {pendingAction.subscription.billing_cycle === "annual" ? "year" : "month"}.
                </>
              )}
              {pendingAction?.kind === "remove" && (
                <>
                  Cancel the subscription for{" "}
                  <strong>{pendingAction.subscription.name}</strong>? This will set their status to cancelled.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant={pendingAction?.kind === "remove" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Saving…"
                : pendingAction?.kind === "upgrade"
                ? "Upgrade"
                : pendingAction?.kind === "downgrade"
                ? "Downgrade"
                : pendingAction?.kind === "renew"
                ? "Renew"
                : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
