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
  basePath?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-[220px] flex-col border-r border-meridian-100 bg-white">
      <div className="flex flex-1 flex-col overflow-y-auto p-3">
        {(orgName || plan) && (
          <div className="mb-4 flex items-center gap-2 px-2">
            {orgName && <span className="truncate text-sm font-semibold text-ink">{orgName}</span>}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                plan === "FREE" && "bg-meridian-50 text-meridian-600",
                plan !== "FREE" && "bg-meridian-50 text-meridian-600"
              )}
            >
              {plan}
            </span>
          </div>
        )}
        <nav className="space-y-4">
          {nav.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
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
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "border-l-2 border-meridian-600 bg-meridian-50 font-semibold text-meridian-600"
                            : highlight
                            ? "text-meridian-600 hover:bg-canvas hover:text-meridian-800"
                            : "text-ink-2 hover:bg-canvas hover:text-ink"
                        )}
                        style={isActive ? { marginLeft: -2, paddingLeft: 14 } : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                        {highlight && !isActive && (
                          <span className="ml-auto rounded-full bg-danger-bg px-1.5 py-0.5 text-[10px] font-bold text-danger">Fix</span>
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
      <div className="border-t border-meridian-100 p-3">
        <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Credits</p>
        <CreditUsage variant="bar" />
      </div>
    </aside>
  );
}
