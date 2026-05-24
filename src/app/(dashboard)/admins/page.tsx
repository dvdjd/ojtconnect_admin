import AdminTable from "@/components/organisms/admin-table";
import RoleManagement from "@/components/organisms/role-management";
import RolePermissionsTable from "@/components/organisms/role-permissions-table";

export default function AdminsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admins</h1>
        <p className="text-sm text-muted-foreground">Manage admin accounts, roles, and permissions</p>
      </div>
      <AdminTable />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RoleManagement />
        </div>
        <div className="lg:col-span-2">
          <RolePermissionsTable />
        </div>
      </div>
    </div>
  );
}
