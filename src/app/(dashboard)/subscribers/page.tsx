import SubscribersTable from "@/components/organisms/subscribers-table";

export default function SubscribersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscribers</h1>
        <p className="text-sm text-muted-foreground">View all active and past platform subscriptions</p>
      </div>
      <SubscribersTable />
    </div>
  );
}
