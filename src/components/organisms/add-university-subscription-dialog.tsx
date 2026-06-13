"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Building2, CalendarDays, ChevronDown, CreditCard, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/lib/utils/api";

interface University {
  university_id: string;
  university_name: string;
}

interface Plan {
  plan_id: string;
  plan_name: string;
  price_monthly: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddUniversitySubscriptionDialog({ open, onOpenChange, onSuccess }: Props) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [universityId, setUniversityId] = useState("");
  const [planId, setPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uniSearch, setUniSearch] = useState("");
  const [uniOpen, setUniOpen] = useState(false);
  const uniRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoadingOptions(true);
    api.get<{ universities: University[]; plans: Plan[]; status: string }>(
      "/api/subscribers/university"
    ).then((res) => {
      if (res.status === "success") {
        setUniversities(res.universities ?? []);
        setPlans(res.plans ?? []);
      }
    }).finally(() => setLoadingOptions(false));
  }, []);

  // Close university dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (uniRef.current && !uniRef.current.contains(e.target as Node)) {
        setUniOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toLocalDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const calcEndDate = (start: string, cycle: string) => {
    if (!start) return "";
    const [y, mo, d] = start.split("-").map(Number);
    const date = new Date(y, mo - 1, d); // local date — avoids UTC offset shift
    if (cycle === "annual") date.setFullYear(date.getFullYear() + 1);
    else date.setMonth(date.getMonth() + 1);
    return toLocalDateStr(date);
  };

  useEffect(() => {
    if (open) {
      const today = toLocalDateStr(new Date());
      setUniversityId("");
      setPlanId("");
      setBillingCycle("monthly");
      setPeriodStart(today);
      setPeriodEnd(calcEndDate(today, "monthly"));
      setError(null);
      setUniSearch("");
      setUniOpen(false);
    }
  }, [open]);

  const handleBillingCycleChange = (cycle: string) => {
    setBillingCycle(cycle);
    setPeriodEnd(calcEndDate(periodStart, cycle));
  };

  const handleStartDateChange = (start: string) => {
    setPeriodStart(start);
    setPeriodEnd(calcEndDate(start, billingCycle));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!universityId || !planId || !periodStart || !periodEnd) {
      return setError("All fields are required.");
    }
    if (new Date(periodEnd) <= new Date(periodStart)) {
      return setError("End date must be after start date.");
    }
    setSaving(true);
    setError(null);
    try {
      const res = await api.post<{ status: string; error?: string }>(
        "/api/subscribers/university",
        { university_id: universityId, plan_id: planId, billing_cycle: billingCycle, current_period_start: periodStart, current_period_end: periodEnd }
      );
      if (res.status === "success") {
        toast.success("University subscription created.");
        onSuccess();
        onOpenChange(false);
      } else {
        const msg = res.error ?? "Failed to create subscription.";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = "Failed to create subscription.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const selectedPlan = plans.find((p) => p.plan_id === planId);
  const selectedUniversity = universities.find((u) => u.university_id === universityId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add University Subscription</DialogTitle>
          <DialogDescription>
            Assign a subscription plan to a university.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">

          {/* Subscriber section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              Subscriber
            </div>

            <div className="flex flex-col gap-1.5" ref={uniRef}>
              <Label>University</Label>
              <div className="relative">
                {/* Trigger button */}
                <button
                  type="button"
                  disabled={loadingOptions}
                  onClick={() => { setUniOpen((v) => !v); setUniSearch(""); }}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={`truncate ${!selectedUniversity ? "text-muted-foreground" : ""}`}>
                    {loadingOptions
                      ? "Loading universities…"
                      : selectedUniversity?.university_name ?? "Select a university"}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {universityId && !loadingOptions && (
                      <X
                        className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
                        onClick={(e) => { e.stopPropagation(); setUniversityId(""); setUniOpen(false); }}
                      />
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>

                {/* Dropdown */}
                {uniOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                    {/* Search input */}
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <input
                        autoFocus
                        placeholder="Search university…"
                        value={uniSearch}
                        onChange={(e) => setUniSearch(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    {/* Options list */}
                    <ul className="max-h-60 overflow-y-auto py-1">
                      {universities
                        .filter((u) =>
                          u.university_name.toLowerCase().includes(uniSearch.toLowerCase())
                        )
                        .map((u) => (
                          <li
                            key={u.university_id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setUniversityId(u.university_id);
                              setUniOpen(false);
                            }}
                            className={`cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                              u.university_id === universityId ? "bg-accent/50 font-medium" : ""
                            }`}
                          >
                            {u.university_name}
                          </li>
                        ))}
                      {universities.filter((u) =>
                        u.university_name.toLowerCase().includes(uniSearch.toLowerCase())
                      ).length === 0 && (
                        <li className="px-3 py-4 text-sm text-center text-muted-foreground">
                          No universities found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Plan section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              Plan &amp; Billing
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Subscription Plan</Label>
              <Select value={planId} onValueChange={(v) => setPlanId(v ?? "")} disabled={loadingOptions}>
                <SelectTrigger className="w-full">
                  <span className={`text-sm capitalize ${!selectedPlan ? "text-muted-foreground" : ""}`}>
                    {loadingOptions
                      ? "Loading plans…"
                      : selectedPlan
                        ? selectedPlan.plan_name
                        : "Select a plan"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {plans.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-center text-muted-foreground">No plans available</div>
                  ) : [...plans].sort((a, b) => {
                      const order = ["starter", "plus", "pro"];
                      return order.indexOf(a.plan_name.toLowerCase()) - order.indexOf(b.plan_name.toLowerCase());
                    }).map((p) => (
                    <SelectItem key={p.plan_id} value={p.plan_id} className="pr-3">
                      <div className="flex items-center justify-between gap-6 w-full px-1.5">
                        <span className="font-medium capitalize">{p.plan_name}</span>
                        <span className="text-xs text-muted-foreground">₱{Number(p.price_monthly).toLocaleString("en-PH")}/mo</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlan && (
                <p className="text-xs text-muted-foreground">
                  ₱{Number(selectedPlan.price_monthly).toLocaleString("en-PH")} / month
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={(v) => v && handleBillingCycleChange(v)}>
                <SelectTrigger>
                  <span className="text-sm capitalize">{billingCycle}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Period section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Subscription Period
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="period-start">Start Date</Label>
                <Input
                  id="period-start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="period-end">End Date</Label>
                <Input
                  id="period-end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  min={periodStart || undefined}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || loadingOptions}>
              {saving ? "Saving…" : "Add Subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
