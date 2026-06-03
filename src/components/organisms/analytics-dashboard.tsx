"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Building2,
  GraduationCap,
  FileText,
  Briefcase,
  CheckCircle,
  Clock,
  CalendarClock,
  UserPlus,
  XCircle,
  Search,
  ListChecks,
} from "lucide-react";

interface RankedItem {
  name: string;
  count: number;
}

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
    reviewing: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
    interview: number;
  };
  signups: {
    last7d: number;
    last30d: number;
  };
  jobs: {
    total: number;
  };
  topCompaniesByJobs: RankedItem[];
  topCompaniesByApplicants: RankedItem[];
  applicantsPerCompany: RankedItem[];
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
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
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

function RankedList({
  title,
  items,
  label,
  loading,
  skeletonCount = 3,
  scrollable = false,
}: {
  title: string;
  items: RankedItem[];
  label: string;
  loading: boolean;
  skeletonCount?: number;
  scrollable?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={scrollable ? "max-h-72 overflow-y-auto pr-1 space-y-2" : "space-y-2"}>
          {loading ? (
            Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                  <span className="text-sm truncate">{item.name}</span>
                </div>
                <span className="text-sm font-semibold shrink-0">
                  {item.count.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{label}</span>
                </span>
              </div>
            ))
          )}
        </div>
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

  if (error) return <p className="text-sm text-destructive">{error}</p>;

  return (
    <div className="space-y-8">

      {/* Users */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Users</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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

      {/* Sign-ups */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Student Sign-ups</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-2 max-w-sm">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard title="Last 7 Days" value={data!.signups.last7d} icon={UserPlus} />
              <StatCard title="Last 30 Days" value={data!.signups.last30d} icon={UserPlus} />
            </>
          )}
        </div>
      </div>

      {/* Applications */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Applications</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard title="Total" value={data!.applications.total} icon={FileText} />
              <StatCard title="Pending" value={data!.applications.pending} icon={Clock} />
              <StatCard title="Reviewing" value={data!.applications.reviewing} icon={Search} />
              <StatCard title="Shortlisted" value={data!.applications.shortlisted} icon={ListChecks} />
              <StatCard title="For Interview" value={data!.applications.interview} icon={CalendarClock} />
              <StatCard title="Accepted" value={data!.applications.accepted} icon={CheckCircle} />
              <StatCard title="Not Selected" value={data!.applications.rejected} icon={XCircle} />
            </>
          )}
        </div>
      </div>

      {/* Jobs */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Jobs</h2>
        <div className="w-56">
          {loading ? <StatCardSkeleton /> : (
            <StatCard title="Total Job Posts" value={data!.jobs.total} icon={Briefcase} />
          )}
        </div>
      </div>

      {/* Rankings */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Rankings</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 items-start">
          <RankedList
            title="Top 10 Companies by Job Posts"
            items={loading ? [] : data!.topCompaniesByJobs}
            label="jobs"
            loading={loading}
            skeletonCount={10}
          />
          <RankedList
            title="Top 3 Companies by Applicants"
            items={loading ? [] : data!.topCompaniesByApplicants}
            label="applicants"
            loading={loading}
            skeletonCount={3}
          />
          <RankedList
            title="Applicants per Company"
            items={loading ? [] : data!.applicantsPerCompany}
            label="applicants"
            loading={loading}
            skeletonCount={5}
            scrollable
          />
        </div>
      </div>

    </div>
  );
}
