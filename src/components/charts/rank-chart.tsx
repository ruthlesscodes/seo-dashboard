"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

// Placeholder data until API provides rank history
function generatePlaceholderData() {
  const now = new Date();
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      avg: 10 + Math.random() * 15,
    });
  }
  return data;
}

export function RankChart({ domain }: { domain?: string }) {
  const data = useMemo(() => generatePlaceholderData(), []);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            reversed
            domain={[1, 30]}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number) => [`#${value}`, "Position"]}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="hsl(38 92% 52%)"
            strokeWidth={2}
            dot={false}
            name="Avg Position"
            isAnimationActive
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Lower position is better. Add keywords and run checks to see real data.
      </p>
    </div>
  );
}
