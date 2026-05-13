"use client";

import { cn } from "@/lib/cn";

type Tier = { label: string; tone: "good" | "warn" | "bad" };

function classifyTitle(len: number): Tier {
  if (len === 0) return { label: "empty", tone: "warn" };
  if (len <= 60) return { label: "great", tone: "good" };
  if (len <= 70) return { label: "long", tone: "warn" };
  return { label: "too long", tone: "bad" };
}

function classifyDescription(len: number): Tier {
  if (len === 0) return { label: "empty", tone: "warn" };
  if (len < 120) return { label: "short", tone: "warn" };
  if (len <= 155) return { label: "great", tone: "good" };
  if (len <= 180) return { label: "long", tone: "warn" };
  return { label: "too long", tone: "bad" };
}

export function CharCount({
  value,
  type,
  recommended,
}: {
  value: string;
  type: "title" | "description";
  recommended?: string;
}) {
  const len = value?.length ?? 0;
  const tier = type === "title" ? classifyTitle(len) : classifyDescription(len);
  const tone =
    tier.tone === "good"
      ? "text-emerald-600"
      : tier.tone === "warn"
        ? "text-amber-600"
        : "text-red-600";
  const target = recommended ?? (type === "title" ? "≤60 ideal, ≤70 max" : "120–155 ideal");
  return (
    <span className={cn("text-xs font-medium tabular-nums", tone)}>
      {len} chars · {tier.label} ({target})
    </span>
  );
}
