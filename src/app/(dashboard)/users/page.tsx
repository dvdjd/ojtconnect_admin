import UsersTable from "@/components/organisms/users-table";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Manage and verify user accounts</p>
      </div>
      <UsersTable />
    </div>
  );
}
