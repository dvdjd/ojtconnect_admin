"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/utils/api";

interface IData {
  user_id: string;
  email: string;
  password: string;
  type: string;
  is_verify: boolean;
  is_active: boolean;
}

interface IResponse {
  status: string;
  message: string;
  data?: IData[];
  total?: number; // total users for pagination
}

interface Filters {
  email?: string;
  type?: string;
  is_verify?: boolean;
  is_active?: boolean;
}

export function useUser(initialFilters: Filters = {}, pageSize = 10) {
  const [users, setUsers] = useState<IData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0); // total users from server

  const fetchUsers = useCallback(
    async (mounted?: boolean) => {
      try {
        const response = await api.post<IResponse>("/api/user", {
          filters,
          page,
          pageSize,
        });
        if (mounted && response.status === "success" && response.data) {
          setUsers(response.data);
          if (response.total !== undefined) setTotal(response.total);
        } else if (mounted) {
          setError(response.message);
        }
      } catch {
        if (mounted) setError("Failed to fetch users");
      } finally {
        if (mounted) setLoading(false);
      }
    },
    [filters, page, pageSize]
  );

  const createUser = useCallback(async (email: string, password: string, type: string) => {
    const response = await api.post<IResponse>("/api/user/create", { email, password, type });
    if (response.status === "success" && response.data) {
      await fetchUsers(true);
    } else {
      throw new Error((response as { error?: string }).error ?? "Failed to create user");
    }
  }, [fetchUsers]);

  const verifyUser = useCallback(async (user_id: string) => {
    try {
      const response = await api.put<IResponse>("/api/user", {
        user_id,
        is_verify: true,
      });

      if (response.status === "success") {
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === user_id ? { ...u, is_verify: true } : u
          )
        );
      }
    } catch {
      setError("Failed to verify user");
    }
  }, []);

  const activateUser = useCallback(async (user_id: string) => {
    try {
      const response = await api.put<IResponse>("/api/user", {
        user_id,
        is_active: true,
      });

      if (response.status === "success") {
        setUsers((prev) => prev.filter((u) => u.user_id !== user_id));
      }
    } catch {
      setError("Failed to activate user");
    }
  }, []);

  const deleteUser = useCallback(async (user_id: string) => {
    try {
      const response = await api.delete<IResponse>(`/api/user`, {
        user_id,
      });
      if (response.status === "success") {
        setUsers((prev) => prev.filter((u) => u.user_id !== user_id));
      } else {
        setError(response.message);
      }
    } catch {
      setError("Failed to delete user");
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchUsers(mounted);
    return () => {
      mounted = false;
    };
  }, [fetchUsers]);

  // helpers for pagination
  const nextPage = () => setPage((prev) => prev + 1);
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (p: number) => setPage(Math.max(p, 1));

  // helper to update filters
  const updateFilters = (newFilters: Filters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // reset page when filters change
  };

  return {
    users,
    loading,
    error,
    filters,
    updateFilters,
    page,
    total,
    pageSize,
    nextPage,
    prevPage,
    goToPage,
    createUser,
    verifyUser,
    activateUser,
    deleteUser,
  };
}
