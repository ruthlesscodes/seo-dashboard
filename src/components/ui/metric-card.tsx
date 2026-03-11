import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: { value: number; direction: "up" | "down" | "neutral" };
  icon?: React.ReactNode;
  className?: string;
  /** Stagger index for cascade animation (60ms intervals) */
  staggerIndex?: number;
}

export function MetricCard({ label, value, change, icon, className, staggerIndex = 0 }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-[6px] border border-border bg-card p-4 transition-[border-color,box-shadow] duration-150 hover:border-primary/40 hover:shadow-[0_0_0_1px_hsl(38_92%_52%_/_0.2)]",
        "animate-fade-up",
        className
      )}
      style={{ animationDelay: `${staggerIndex * 60}ms`, animationFillMode: "backwards" } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        {icon && <div className="text-muted-foreground opacity-70">{icon}</div>}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground animate-number-tick">
        {value}
      </p>
      {change && (
        <p
          className={cn(
            "mt-1 text-xs font-mono",
            change.direction === "up" && "text-rank-up",
            change.direction === "down" && "text-rank-down",
            change.direction === "neutral" && "text-muted-foreground"
          )}
        >
          {change.direction === "up" && "↑ "}
          {change.direction === "down" && "↓ "}
          {change.value}
        </p>
      )}
    </div>
  );
}
