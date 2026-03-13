"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Globe } from "lucide-react";
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
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-meridian-100 bg-white px-4">
      <div className="flex items-center gap-4">
        {domain && (
          <div className="flex items-center gap-2 rounded-full border border-meridian-100 bg-canvas px-3 py-1.5">
            <Globe className="h-4 w-4 text-ink-3" />
            <span className="text-sm font-medium text-ink-2">{domain}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <CreditUsage variant="pill" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full outline-none ring-meridian-600 focus:ring-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="bg-meridian-50 text-sm font-semibold text-meridian-600"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              align="end"
              className="min-w-48 animate-scale-in rounded-lg border border-meridian-100 bg-white p-1 shadow-lg"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-sm font-normal text-ink">
                <div className="flex flex-col">
                  {user?.name && <span className="font-semibold">{user.name}</span>}
                  {user?.email && (
                    <span className="text-xs text-ink-3">{user.email}</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 h-px bg-meridian-100" />
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-ink-2 outline-none hover:bg-canvas hover:text-ink"
                onSelect={() => router.push("/dashboard/settings")}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-ink-2 outline-none hover:bg-canvas hover:text-ink"
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
