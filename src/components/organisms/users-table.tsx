"use client";

import React, { useState } from "react";
import { CheckCircle, Eye, Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { useUser } from "@/core/hooks/useUser";
import { StatusBadge } from "@/components/atoms/status-badge";
import { FilterBar } from "@/components/molecules/filter-bar";
import { PaginationControls } from "@/components/molecules/pagination-controls";
import { UserDetailsDialog } from "@/components/organisms/user-details-dialog";
import { CreateUserDialog } from "@/components/organisms/create-user-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SelectedUser {
  user_id: string;
  email: string;
  type: string;
  is_verify: boolean;
  is_active: boolean;
}

type ConfirmAction = "verify" | "deactivate" | "activate" | "hard_delete";

export default function UsersTable() {
  const {
    users,
    loading,
    error,
    filters,
    page,
    total,
    pageSize,
    updateFilters,
    nextPage,
    prevPage,
    createUser,
    verifyUser,
    activateUser,
    deleteUser,
    hardDeleteUser,
  } = useUser();

  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<SelectedUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const handleViewDetails = (user: SelectedUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const openConfirm = (user: SelectedUser, action: ConfirmAction) => {
    setConfirmUser(user);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    setConfirmUser(null);
    setConfirmAction(null);
  };

  const handleConfirm = async () => {
    if (!confirmUser || !confirmAction) return;
    if (confirmAction === "verify") await verifyUser(confirmUser.user_id);
    if (confirmAction === "deactivate") await deleteUser(confirmUser.user_id);
    if (confirmAction === "activate") await activateUser(confirmUser.user_id);
    if (confirmAction === "hard_delete") await hardDeleteUser(confirmUser.user_id);
    closeConfirm();
  };

  const confirmMeta: Record<ConfirmAction, { title: string; description: (email: string) => React.ReactNode; label: string; destructive?: boolean }> = {
    verify: {
      title: "Approve User",
      description: (email) => <>Are you sure you want to approve <span className="font-semibold text-foreground">{email}</span>?{" "}They will be able to fully access the platform.</>,
      label: "Approve",
    },
    deactivate: {
      title: "Deactivate User",
      description: (email) => <>Are you sure you want to deactivate <span className="font-semibold text-foreground">{email}</span>?{" "}They will lose access to the platform.</>,
      label: "Deactivate",
      destructive: true,
    },
    activate: {
      title: "Activate User",
      description: (email) => <>Are you sure you want to reactivate <span className="font-semibold text-foreground">{email}</span>?{" "}They will regain access to the platform.</>,
      label: "Activate",
    },
    hard_delete: {
      title: "Permanently Delete User",
      description: (email) => <>Are you sure you want to permanently delete <span className="font-semibold text-foreground">{email}</span>?{" "}This cannot be undone and all their data will be lost.</>,
      label: "Delete Permanently",
      destructive: true,
    },
  };

  const meta = confirmAction ? confirmMeta[confirmAction] : null;

  return (
    <>
      <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">User Accounts</CardTitle>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add User
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar
            email={filters.email ?? ""}
            type={filters.type ?? "all"}
            isVerify={filters.is_verify === undefined ? "all" : String(filters.is_verify)}
            isActive={filters.is_active === undefined ? "true" : String(filters.is_active)}
            onEmailChange={(v) => updateFilters({ email: v || undefined })}
            onTypeChange={(v) => updateFilters({ type: v === "all" ? undefined : v })}
            onVerifyChange={(v) => updateFilters({ is_verify: v === "all" ? undefined : v === "true" })}
            onActiveChange={(v) => updateFilters({ is_active: v === "all" ? undefined : v === "true" })}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">{user.type}</TableCell>
                      <TableCell>
                        <StatusBadge verified={user.is_verify} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewDetails(user)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openConfirm(user, "verify")}
                            disabled={user.is_verify}
                            title="Approve user"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          {user.is_active ? (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive border-destructive/40 hover:bg-destructive hover:text-white hover:border-destructive"
                              onClick={() => openConfirm(user, "deactivate")}
                              title="Deactivate user"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-green-600 border-green-600/40 hover:bg-green-600 hover:text-white hover:border-green-600"
                              onClick={() => openConfirm(user, "activate")}
                              title="Activate user"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive border-destructive/40 hover:bg-destructive hover:text-white hover:border-destructive"
                            onClick={() => openConfirm(user, "hard_delete")}
                            title="Permanently delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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

      <UserDetailsDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={createUser}
      />

      <Dialog open={!!confirmUser} onOpenChange={(open) => !open && closeConfirm()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{meta?.title}</DialogTitle>
            <DialogDescription>
              {meta?.description(confirmUser?.email ?? "")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button
              className={
                meta?.destructive
                  ? "bg-destructive text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }
              onClick={handleConfirm}
            >
              {meta?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
