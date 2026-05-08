"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { useApplications, type ApplicationData } from "@/core/hooks/useApplications";
import { ApplicationDetailsDialog } from "@/components/organisms/application-details-dialog";
import { PaginationControls } from "@/components/molecules/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
  withdrawn: "outline",
};

const STATUS_LABELS: Record<string, string> = {
  all: "All status",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export default function ApplicationsTable() {
  const {
    applications,
    loading,
    error,
    filters,
    page,
    total,
    pageSize,
    updateFilters,
    nextPage,
    prevPage,
  } = useApplications();

  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentStatus = filters.status ?? "all";

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-company">Company</Label>
              <Input
                id="filter-company"
                placeholder="Search by company…"
                value={filters.company ?? ""}
                onChange={(e) => updateFilters({ company: e.target.value || undefined })}
                className="w-56"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={currentStatus}
                onValueChange={(v) => updateFilters({ status: v === "all" ? undefined : v ?? undefined })}
              >
                <SelectTrigger className="w-40">
                  <span className="text-sm">{STATUS_LABELS[currentStatus] ?? "All status"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => {
                    const studentName =
                      [app.student_profile.first_name, app.student_profile.last_name]
                        .filter(Boolean)
                        .join(" ") || "—";
                    const date = new Date(app.application_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    return (
                      <TableRow key={app.application_id}>
                        <TableCell className="font-medium">{studentName}</TableCell>
                        <TableCell className="text-muted-foreground">{app.job_post.position ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{app.job_post.company_profile.name}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANTS[app.status] ?? "secondary"} className="capitalize">
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{date}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            title="View details"
                            onClick={() => { setSelectedApp(app); setDialogOpen(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
            pageSize={pageSize}
            onPrev={prevPage}
            onNext={nextPage}
          />
        </CardContent>
      </Card>

      <ApplicationDetailsDialog
        application={selectedApp}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
