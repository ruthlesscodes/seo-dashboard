"use client";

import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  size = 120,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDash = (score / 100) * circumference;
  const color =
    score >= 80 ? "hsl(142 71% 45%)" : score >= 50 ? "hsl(38 92% 52%)" : "hsl(0 72% 55%)";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-2xl font-bold tabular-nums text-ink">{score}</span>
    </div>
  );
}
