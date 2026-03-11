import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function scoreColor(score: number): string {
  if (score >= 80) return "text-rank-up";
  if (score >= 50) return "text-severity-warning";
  return "text-severity-critical";
}

export function truncateStr(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "\u2026";
}
