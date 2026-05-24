"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAdmin, IAdmin } from "@/core/hooks/useAdmin";
import { AdminDialog } from "@/components/organisms/admin-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

function RoleBadge({ role }: { role: string | null }) {
  const colors: Record<string, string> = {
    super_admin: "bg-purple-100 text-purple-700",
    marketing: "bg-blue-100 text-blue-700",
    recruitment: "bg-green-100 text-green-700",
  };
  const label = role ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";
  const color = role ? (colors[role] ?? "bg-muted text-muted-foreground") : "";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

export default function AdminTable() {
  const { admins, loading, error, createAdmin, updateAdmin, deleteAdmin } = useAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<IAdmin | null>(null);
  const [confirmAdmin, setConfirmAdmin] = useState<IAdmin | null>(null);

  const handleAdd = () => {
    setSelectedAdmin(null);
    setDialogOpen(true);
  };

  const handleEdit = (admin: IAdmin) => {
    setSelectedAdmin(admin);
    setDialogOpen(true);
  };

  const handleSave = async (username: string, password: string, role: string) => {
    if (selectedAdmin) {
      await updateAdmin(selectedAdmin.id, username, role, password || undefined);
    } else {
      await createAdmin(username, password, role);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Admin Accounts</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add Admin
          </Button>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No admins found.
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.username ?? "—"}</TableCell>
                      <TableCell><RoleBadge role={admin.role} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {admin.created_at
                          ? new Date(admin.created_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(admin)}
                            title="Edit admin"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                            onClick={() => setConfirmAdmin(admin)}
                            title="Delete admin"
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
        </CardContent>
      </Card>

      <AdminDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        admin={selectedAdmin}
        onSave={handleSave}
      />

      <Dialog open={!!confirmAdmin} onOpenChange={(open) => !open && setConfirmAdmin(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{confirmAdmin?.username}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAdmin(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (confirmAdmin) {
                  await deleteAdmin(confirmAdmin.id);
                  setConfirmAdmin(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
