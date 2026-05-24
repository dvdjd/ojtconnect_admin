import AdminTable from "@/components/organisms/admin-table";

export default function AdminsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admins</h1>
        <p className="text-sm text-muted-foreground">Manage admin accounts</p>
      </div>
      <AdminTable />
    </div>
  );
}
