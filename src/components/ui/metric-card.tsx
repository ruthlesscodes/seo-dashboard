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
        "rounded-[6px] border border-meridian-100 bg-white p-4 transition-[border-color,box-shadow] duration-150 hover:border-meridian-200 hover:shadow-[0_0_0_1px_rgba(24,95,165,0.2)]",
        "animate-fade-up",
        className
      )}
      style={{ animationDelay: `${staggerIndex * 60}ms`, animationFillMode: "backwards" } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-2">{label}</p>
        {icon && <div className="text-ink-2 opacity-70">{icon}</div>}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-ink animate-number-tick">
        {value}
      </p>
      {change && (
        <p
          className={cn(
            "mt-1 text-xs font-mono",
            change.direction === "up" && "text-rank-up",
            change.direction === "down" && "text-rank-down",
            change.direction === "neutral" && "text-ink-2"
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
