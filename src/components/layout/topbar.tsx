"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { CreditUsage } from "./credit-usage";
import { cn } from "@/lib/utils";

export function TopBar({
  user,
  domain,
}: {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  domain?: string | null;
}) {
  const router = useRouter();
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        {domain && (
          <div className="flex items-center gap-2 rounded-[6px] border border-border bg-background px-3 py-1.5">
            <span className="text-sm font-mono tabular-nums text-muted-foreground">{domain}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <CreditUsage variant="pill" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full outline-none ring-primary focus:ring-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className={cn(
                    "bg-primary/20 text-sm font-medium text-primary"
                  )}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
          <DropdownMenuContent
            align="end"
            className="min-w-48 animate-scale-in rounded-[6px] border border-border bg-popover p-1 shadow-lg"
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-sm font-normal">
              <div className="flex flex-col">
                {user?.name && <span>{user.name}</span>}
                {user?.email && (
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 h-px bg-border"             />
            <DropdownMenuItem
              className="cursor-pointer rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent"
              onSelect={() => router.push("/dashboard/settings")}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent"
              onSelect={() => signOut({ callbackUrl: "/auth/login" })}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>
    </header>
  );
}
