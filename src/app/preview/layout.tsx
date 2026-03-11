import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

/** Preview layout — no auth required. Use /preview to see the dashboard UI. */
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mockUser = {
    name: "Preview User",
    email: "preview@example.com",
    image: null,
  };
  const mockDomain = "example.com";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar plan="GROWTH" orgName={mockUser.name} basePath="/preview" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar user={mockUser} domain={mockDomain} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
