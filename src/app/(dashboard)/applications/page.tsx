import ApplicationsTable from "@/components/organisms/applications-table";

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="text-sm text-muted-foreground">View and monitor student job applications</p>
      </div>
      <ApplicationsTable />
    </div>
  );
}
