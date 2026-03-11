"use client";

import { cn } from "@/lib/utils";

export function DiffViewer({ diff }: { diff: string | null }) {
  if (!diff) return <p className="text-sm text-muted-foreground">No diff available</p>;

  const lines = diff.split("\n");

  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
      {lines.map((line, i) => {
        const added = line.startsWith("+") && !line.startsWith("+++");
        const removed = line.startsWith("-") && !line.startsWith("---");
        return (
          <div
            key={i}
            className={cn(
              "py-0.5 px-2 -mx-2",
              added && "diff-added",
              removed && "diff-removed"
            )}
          >
            {line}
          </div>
        );
      })}
    </pre>
  );
}
