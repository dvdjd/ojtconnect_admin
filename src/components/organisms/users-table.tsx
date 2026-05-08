"use client";

import { useState } from "react";
import { CheckCircle, Eye, Trash2 } from "lucide-react";
import { useUser } from "@/core/hooks/useUser";
import { StatusBadge } from "@/components/atoms/status-badge";
import { FilterBar } from "@/components/molecules/filter-bar";
import { PaginationControls } from "@/components/molecules/pagination-controls";
import { UserDetailsDialog } from "@/components/organisms/user-details-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

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
    verifyUser,
    deleteUser,
  } = useUser();

  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetails = (user: SelectedUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar
            email={filters.email ?? ""}
            type={filters.type ?? "all"}
            isVerify={
              filters.is_verify === undefined ? "all" : String(filters.is_verify)
            }
            onEmailChange={(v) => updateFilters({ email: v || undefined })}
            onTypeChange={(v) => updateFilters({ type: v === "all" ? undefined : v })}
            onVerifyChange={(v) =>
              updateFilters({ is_verify: v === "all" ? undefined : v === "true" })
            }
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
                            onClick={() => verifyUser(user.user_id)}
                            disabled={user.is_verify}
                            title="Verify user"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                            onClick={() => deleteUser(user.user_id)}
                            title="Delete user"
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
    </>
  );
}
