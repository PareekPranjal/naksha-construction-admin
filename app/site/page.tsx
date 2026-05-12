"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { GlobalDoc } from "@/lib/types";
import { Card, PageHeader } from "@/components/ui";

const SUGGESTED = ["navbar", "footer", "siteSettings", "social", "contactInfo"];

export default function SiteGlobalsListPage() {
  const [rows, setRows] = useState<GlobalDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<GlobalDoc[]>("/globals")
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div>
      <PageHeader
        title="Site globals"
        description="Site-wide singletons: navbar, footer, settings. Each is a JSON value the website fetches by key."
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {rows && rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {rows.map((g) => (
            <Link
              key={g.id}
              href={`/site/${encodeURIComponent(g.key)}`}
              className="rounded-lg border border-rule bg-white p-4 hover:border-ink"
            >
              <p className="text-sm font-medium">{g.key}</p>
              <p className="text-xs text-muted mt-1 truncate font-mono">
                {JSON.stringify(g.value).slice(0, 90)}…
              </p>
            </Link>
          ))}
        </div>
      )}

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          Open or create
        </h3>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((k) => (
            <Link
              key={k}
              href={`/site/${k}`}
              className="rounded-md border border-rule bg-white px-3 py-1.5 text-sm hover:border-ink"
            >
              {k}
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">
          Or click any suggestion to start editing — saving creates the global if it doesn&apos;t exist.
        </p>
      </Card>
    </div>
  );
}
