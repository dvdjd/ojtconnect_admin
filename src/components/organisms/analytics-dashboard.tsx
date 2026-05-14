"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, GraduationCap, FileText, Briefcase, CheckCircle, Clock } from "lucide-react";

interface AnalyticsData {
  users: {
    total: number;
    students: number;
    companies: number;
    universities: number;
    verified: number;
    pending: number;
  };
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  jobs: {
    total: number;
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") {
          setData(json.data);
        } else {
          setError("Failed to load analytics");
        }
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <p className="text-sm text-destructive">{error}</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="grid grid-cols-2 gap-4 mt-3 sm:grid-cols-3 lg:grid-cols-5">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard title="Total Users" value={data!.users.total} icon={Users} />
              <StatCard title="Students" value={data!.users.students} icon={GraduationCap} />
              <StatCard title="Companies" value={data!.users.companies} icon={Building2} />
              <StatCard title="Universities" value={data!.users.universities} icon={GraduationCap} />
              <StatCard
                title="Verified"
                value={data!.users.verified}
                icon={CheckCircle}
                description={`${data!.users.pending} pending`}
              />
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Applications</h2>
        <div className="grid grid-cols-2 gap-4 mt-3 sm:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard title="Total Applications" value={data!.applications.total} icon={FileText} />
              <StatCard title="Pending" value={data!.applications.pending} icon={Clock} />
              <StatCard title="Accepted" value={data!.applications.accepted} icon={CheckCircle} />
              <StatCard title="Rejected" value={data!.applications.rejected} icon={FileText} />
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Jobs</h2>
        <div className="grid grid-cols-2 gap-4 mt-3 sm:grid-cols-4">
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard title="Total Job Posts" value={data!.jobs.total} icon={Briefcase} />
          )}
        </div>
      </div>
    </div>
  );
}
