import { cookies } from "next/headers";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { Toaster } from "sonner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await verifyJWT(token) : null;
  const role = payload ? (payload as { role?: string }).role : null;

  const [allRoutes, allowedPerms] = await Promise.all([
    prisma.nav_route.findMany({ orderBy: { sort_order: "asc" } }),
    role ? prisma.role_permission.findMany({ where: { role_slug: role } }) : Promise.resolve([]),
  ]);

  const allowedRoutes = allowedPerms.map((p) => p.route);

  return (
    <SidebarProvider>
      <AppSidebar role={role} navRoutes={allRoutes} allowedRoutes={allowedRoutes} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">OJT Connect Admin</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
