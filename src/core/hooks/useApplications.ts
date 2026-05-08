"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/utils/api";

export interface ApplicationData {
  application_id: string;
  status: string;
  application_date: string;
  interview_date?: string | null;
  meeting_link?: string | null;
  is_accepted: boolean;
  is_withdrawn: boolean;
  rejection_reason?: string | null;
  notes?: string | null;
  message: string;
  resume?: string | null;
  job_post: {
    job_id: string;
    position?: string | null;
    category?: string | null;
    work_setup?: string | null;
    description?: string | null;
    duration?: string | null;
    hours_per_week?: string | null;
    company_profile: {
      name: string;
      company_type?: string | null;
    };
  };
  student_profile: {
    student_id: string;
    first_name?: string | null;
    last_name?: string | null;
    university?: string | null;
    course?: string | null;
  };
}

interface Filters {
  company?: string;
  status?: string;
}

interface IResponse {
  status: string;
  message?: string;
  data?: ApplicationData[];
  total?: number;
}

export function useApplications(initialFilters: Filters = {}, pageSize = 10) {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchApplications = useCallback(
    async (mounted?: boolean) => {
      setLoading(true);
      try {
        const response = await api.post<IResponse>("/api/applications", {
          filters,
          page,
          pageSize,
        });
        if (mounted && response.status === "success" && response.data) {
          setApplications(response.data);
          if (response.total !== undefined) setTotal(response.total);
        } else if (mounted) {
          setError(response.message ?? "Failed to load applications");
        }
      } catch {
        if (mounted) setError("Failed to fetch applications");
      } finally {
        if (mounted) setLoading(false);
      }
    },
    [filters, page, pageSize]
  );

  useEffect(() => {
    let mounted = true;
    fetchApplications(mounted);
    return () => { mounted = false; };
  }, [fetchApplications]);

  const updateFilters = (newFilters: Filters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  return {
    applications,
    loading,
    error,
    filters,
    updateFilters,
    page,
    total,
    pageSize,
    nextPage,
    prevPage,
  };
}
