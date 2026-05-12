"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { RESOURCES } from "@/lib/resources";
import { cn } from "@/lib/cn";

type Health = { status: string; checks: Record<string, string> };

export default function Dashboard() {
  const [health, setHealth] = useState<Health | null>(null);
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Health>("/health")
      .then(setHealth)
      .catch((e: ApiError) => setError(e.message));

    Object.values(RESOURCES).forEach((r) => {
      api
        .get<unknown[]>(r.apiPath)
        .then((items) => setCounts((c) => ({ ...c, [r.key]: items.length })))
        .catch(() => setCounts((c) => ({ ...c, [r.key]: null })));
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted mt-1">
        Overview of your CMS. API: {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            health?.status === "ok" ? "bg-emerald-500" : "bg-red-500",
          )}
        />
        <span className="text-sm">
          API status: <strong>{health?.status ?? (error ? "unreachable" : "checking…")}</strong>
          {health && (
            <span className="text-muted ml-2">
              {Object.entries(health.checks)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ")}
            </span>
          )}
        </span>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Collections</h2>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.values(RESOURCES).map((r) => (
          <Link
            key={r.key}
            href={`/${r.key}`}
            className="rounded-lg border border-rule bg-white p-4 hover:border-ink transition-colors"
          >
            <p className="text-sm text-muted">{r.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {counts[r.key] === null ? "—" : counts[r.key] ?? "…"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
