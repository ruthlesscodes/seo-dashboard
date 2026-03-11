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
    pct < 50 ? "bg-[hsl(142_71%_45%)]" : pct < 80 ? "bg-primary" : "bg-destructive";

  if (loading) {
    if (variant === "bar") {
      return (
        <div className="w-full space-y-1">
          <div className="h-2 w-full animate-pulse rounded-[6px] bg-muted" />
          <span className="text-xs text-muted-foreground">— / —</span>
        </div>
      );
    }
    return (
      <div className="h-8 min-w-[4rem] animate-pulse rounded-[6px] bg-muted" />
    );
  }

  const content = (
    <div className={cn("flex items-center gap-2", variant === "bar" && "w-full flex-col")}>
      <div className={cn("flex items-center gap-2", variant === "bar" && "w-full")}>
        {variant === "bar" ? (
          <Progress.Root value={pct} className="h-2 flex-1 overflow-hidden rounded-[6px] bg-muted">
            <Progress.Indicator
              className={cn("h-full transition-[width] duration-700 ease-out", barColor)}
              style={{ width: `${pct}%` }}
            />
          </Progress.Root>
        ) : (
          <span className="text-sm tabular-nums">
            {remaining}/{limit}
          </span>
        )}
      </div>
      {variant === "bar" && (
        <span className="w-full text-left text-xs text-muted-foreground">
          {remaining} / {limit} credits
        </span>
      )}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "rounded-[6px] transition-colors hover:bg-accent/50 active:scale-[0.98]",
            variant === "bar" && "w-full p-2 text-left",
            variant === "pill" && "rounded-[6px] border border-border bg-muted/50 px-3 py-1.5 font-mono text-xs tabular-nums"
          )}
          type="button"
        >
          {variant === "bar" ? content : (
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {remaining} / {limit}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align={variant === "bar" ? "center" : "end"} className="w-64 animate-scale-in rounded-[6px]">
        <div className="space-y-2">
          <p className="text-sm font-medium">Credit usage</p>
          <p className="text-xs text-muted-foreground">
            {remaining} of {limit} remaining
          </p>
          {usage?.breakdown && usage.breakdown.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {usage.breakdown.map((row, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="truncate">{row.operation}</span>
                  <span className="tabular-nums text-muted-foreground">{row.credits ?? row.calls}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
