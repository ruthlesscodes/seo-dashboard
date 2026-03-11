"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Search,
  TrendingUp,
  Users,
  FileText,
  Brain,
  Eye,
  ShieldCheck,
  Globe,
  Workflow,
  Settings,
  CreditCard,
  Newspaper,
  Megaphone,
  Map,
} from "lucide-react";
import { CreditUsage } from "./credit-usage";
import { cn } from "@/lib/utils";

const nav = [
  { label: "OVERVIEW", items: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Priorities", href: "/dashboard/priorities", icon: ListChecks, highlight: true },
  ] },
  {
    label: "RESEARCH",
    items: [
      { label: "Keywords", href: "/dashboard/keywords", icon: Search },
      { label: "Rankings", href: "/dashboard/rankings", icon: TrendingUp },
      { label: "Competitors", href: "/dashboard/competitors", icon: Users },
      { label: "Search", href: "/dashboard/search", icon: Newspaper },
      { label: "Brand", href: "/dashboard/brand", icon: Megaphone },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { label: "Content Studio", href: "/dashboard/content", icon: FileText },
      { label: "Intelligence", href: "/dashboard/intelligence", icon: Brain },
    ],
  },
  {
    label: "MONITORING",
    items: [
      { label: "Monitor", href: "/dashboard/monitor", icon: Eye },
      { label: "Audit", href: "/dashboard/audit", icon: ShieldCheck },
      { label: "Domain", href: "/dashboard/domain", icon: Map },
      { label: "GEO/AEO", href: "/dashboard/geo", icon: Globe },
    ],
  },
  {
    label: "AUTOMATION",
    items: [{ label: "Pipeline", href: "/dashboard/pipeline", icon: Workflow }],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    ],
  },
];

export function Sidebar({
  plan = "FREE",
  orgName,
  basePath = "/dashboard",
}: {
  plan?: string;
  orgName?: string;
  /** Base path for nav links (e.g. /preview for unauthenticated preview) */
  basePath?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      <div className="flex flex-1 flex-col overflow-y-auto p-3">
        {(orgName || plan) && (
          <div className="mb-4 flex items-center gap-2 px-2">
            {orgName && <span className="font-display truncate text-sm font-medium">{orgName}</span>}
            <span
              className={cn(
                "rounded-[6px] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                plan === "FREE" && "bg-muted text-muted-foreground",
                plan !== "FREE" && "bg-primary/20 text-primary"
              )}
            >
              {plan}
            </span>
          </div>
        )}
        <nav className="space-y-4">
          {nav.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const href = item.href.replace(/^\/dashboard/, basePath);
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  const Icon = item.icon;
                  const highlight = (item as { highlight?: boolean }).highlight;
                  return (
                    <li key={item.href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "animate-slide-in-left border-l-2 border-primary bg-primary/10 text-foreground"
                            : highlight ? "text-primary hover:bg-primary/5" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                        style={isActive ? { marginLeft: -2, paddingLeft: 14 } : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                        {highlight && !isActive && (
                          <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">Fix</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-border p-3">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Credits</p>
        <CreditUsage variant="bar" />
      </div>
    </aside>
  );
}
