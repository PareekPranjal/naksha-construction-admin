"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { getResource } from "@/lib/resources";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/ui";

export default function ResourceListPage() {
  const params = useParams<{ resource: string }>();
  const resource = getResource(params.resource);
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resource) return;
    api
      .get<Record<string, unknown>[]>(resource.apiPath)
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, [resource]);

  if (!resource) return notFound();

  const columns = resource.listColumns.map((c) => ({ key: c, label: c }));

  return (
    <div>
      <PageHeader
        title={resource.label}
        description={`${rows?.length ?? "…"} item${rows?.length === 1 ? "" : "s"}`}
        action={
          <Link
            href={`/${resource.key}/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper hover:bg-accent"
          >
            <Plus className="h-4 w-4" /> New {resource.label.replace(/s$/, "").toLowerCase()}
          </Link>
        }
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {rows ? (
        <DataTable
          rows={rows as { id: string }[]}
          columns={columns}
          rowHref={(row) => `/${resource.key}/${row.id}`}
        />
      ) : (
        <p className="text-sm text-muted">Loading…</p>
      )}
    </div>
  );
}
