"use client";

import { useEffect, useState } from "react";
import * as Progress from "@radix-ui/react-progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { getUsage } from "@/actions/auth";
import { cn } from "@/lib/utils";

type Variant = "bar" | "pill";

export function CreditUsage({ variant = "bar" }: { variant?: Variant }) {
  const [usage, setUsage] = useState<{
    credits: { used: number; limit: number; remaining: number };
    breakdown?: { operation: string; calls: number; credits: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getUsage()
      .then((res: any) => {
        if (!res) return;
        if (res.credits) setUsage(res);
        else if (res.meta)
          setUsage({
            credits: {
              used: res.meta.creditsUsed ?? 0,
              limit: (res.meta.creditsUsed ?? 0) + (res.meta.creditsRemaining ?? 0) || 100,
              remaining: res.meta.creditsRemaining ?? 0,
            },
            breakdown: res.breakdown ?? res.data?.breakdown,
          });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const used = usage?.credits?.used ?? 0;
  const limit = usage?.credits?.limit ?? 100;
  const remaining = usage?.credits?.remaining ?? limit - used;
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const barColor =
    pct < 80 ? "bg-meridian-600" : pct < 90 ? "bg-warning" : "bg-danger";

  if (loading) {
    if (variant === "bar") {
      return (
        <div className="w-full space-y-1">
          <div className="h-2 w-full animate-pulse rounded-lg bg-meridian-100" />
          <span className="text-xs text-ink-3">— / —</span>
        </div>
      );
    }
    return (
      <div className="h-8 min-w-[4rem] animate-pulse rounded-lg bg-meridian-100" />
    );
  }

  const content = (
    <div className={cn("flex items-center gap-2", variant === "bar" && "w-full flex-col")}>
      <div className={cn("flex items-center gap-2", variant === "bar" && "w-full")}>
        {variant === "bar" ? (
          <Progress.Root value={pct} className="h-2 flex-1 overflow-hidden rounded-full bg-meridian-100">
            <Progress.Indicator
              className={cn("h-full transition-[width] duration-700 ease-out", barColor)}
              style={{ width: `${pct}%` }}
            />
          </Progress.Root>
        ) : (
          <span className="text-sm font-medium tabular-nums text-ink-2">
            {remaining} / {limit}
          </span>
        )}
      </div>
      {variant === "bar" && (
        <span className="w-full text-left text-xs text-ink-3">
          Credits remaining — {remaining.toLocaleString()} / {limit.toLocaleString()}
        </span>
      )}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "rounded-lg transition-colors hover:bg-canvas active:scale-[0.98]",
            variant === "bar" && "w-full p-2 text-left",
            variant === "pill" && "rounded-full border border-meridian-100 bg-canvas px-3 py-1.5 text-xs font-medium tabular-nums text-ink-2"
          )}
          type="button"
        >
          {variant === "bar" ? content : (
            <span className="text-sm font-medium tabular-nums text-ink-2">
              {remaining} / {limit}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align={variant === "bar" ? "center" : "end"} className="w-64 animate-scale-in rounded-xl border border-meridian-100 bg-white p-4 shadow-lg">
        <div className="space-y-2">
          <p className="text-sm font-bold text-ink">Credit usage</p>
          <p className="text-xs text-ink-3">
            {remaining.toLocaleString()} of {limit.toLocaleString()} remaining
          </p>
          {usage?.breakdown && usage.breakdown.length > 0 && (
            <div className="mt-3 max-h-40 space-y-1 overflow-y-auto">
              {usage.breakdown.map((row, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="truncate text-ink-2">{row.operation}</span>
                  <span className="tabular-nums text-ink-3">{row.credits ?? row.calls}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
