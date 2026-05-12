"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getResource } from "@/lib/resources";
import { ResourceForm } from "@/components/ResourceForm";
import { PageHeader } from "@/components/ui";

export default function EditResourcePage() {
  const params = useParams<{ resource: string; id: string }>();
  const resource = getResource(params.resource);
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resource) return;
    api
      .get<Record<string, unknown>>(`${resource.apiPath}/${params.id}`)
      .then(setItem)
      .catch((e: Error) => setError(e.message));
  }, [resource, params.id]);

  if (!resource) return notFound();

  return (
    <div>
      <PageHeader
        title={String(item?.title ?? item?.name ?? item?.city ?? item?.author ?? "Edit")}
        description={`Editing in ${resource.label}`}
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {item ? <ResourceForm resource={resource} mode="edit" id={params.id} initial={item} /> : <p className="text-sm text-muted">Loading…</p>}
    </div>
  );
}
