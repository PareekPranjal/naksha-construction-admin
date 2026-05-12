"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { PageDoc } from "@/lib/types";
import { DataTable } from "@/components/DataTable";
import { Button, PageHeader } from "@/components/ui";

export default function PagesListPage() {
  const [rows, setRows] = useState<PageDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PageDoc[]>("/pages")
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Block-based page documents — one row per route on the website."
        action={
          <Link
            href="/pages/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper hover:bg-accent"
          >
            <Plus className="h-4 w-4" /> New page
          </Link>
        }
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {rows ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "title", label: "Title" },
            { key: "path", label: "URL" },
            { key: "key", label: "Key" },
          ]}
          rowHref={(row) => `/pages/${row.id}`}
        />
      ) : (
        <p className="text-sm text-muted">Loading…</p>
      )}
    </div>
  );
}
