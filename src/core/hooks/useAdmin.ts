"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/utils/api";

export interface IAdmin {
  id: number;
  username: string | null;
  password: string | null;
  role: string | null;
  created_at: string | null;
}

interface IResponse {
  status: string;
  data?: IAdmin | IAdmin[];
}

export function useAdmin() {
  const [admins, setAdmins] = useState<IAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await api.get<{ status: string; data?: IAdmin[] }>("/api/admin");
      if (response.status === "success" && response.data) {
        setAdmins(response.data);
      }
    } catch {
      setError("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  }, []);

  const createAdmin = useCallback(async (username: string, password: string, role: string) => {
    const response = await api.post<IResponse>("/api/admin", { username, password, role });
    if (response.status === "success" && response.data && !Array.isArray(response.data)) {
      setAdmins((prev) => [response.data as IAdmin, ...prev]);
    } else {
      throw new Error("Failed to create admin");
    }
  }, []);

  const updateAdmin = useCallback(async (id: number, username: string, role: string, password?: string) => {
    const response = await api.put<IResponse>("/api/admin", { id, username, role, password });
    if (response.status === "success" && response.data && !Array.isArray(response.data)) {
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? (response.data as IAdmin) : a))
      );
    } else {
      throw new Error("Failed to update admin");
    }
  }, []);

  const deleteAdmin = useCallback(async (id: number) => {
    const response = await api.delete<IResponse>("/api/admin", { id });
    if (response.status === "success") {
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } else {
      throw new Error("Failed to delete admin");
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return { admins, loading, error, createAdmin, updateAdmin, deleteAdmin };
}
