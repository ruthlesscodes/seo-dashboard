import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const plan = (session.user as { seoPlan?: string }).seoPlan ?? "FREE";
  const domain = (session.user as { seoDomain?: string }).seoDomain;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar plan={plan} orgName={session.user.name ?? undefined} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar user={session.user} domain={domain} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
