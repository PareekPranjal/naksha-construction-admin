"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { PageDoc } from "@/lib/types";
import { PageForm } from "@/components/PageForm";
import { PageHeader } from "@/components/ui";

export default function EditPagePage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<PageDoc | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PageDoc>(`/pages/${id}`)
      .then(setPage)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  return (
    <div>
      <PageHeader
        title={page?.title ?? "Edit page"}
        description={page ? `URL: ${page.path}` : undefined}
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {page ? <PageForm mode="edit" initial={page} /> : <p className="text-sm text-muted">Loading…</p>}
    </div>
  );
}
