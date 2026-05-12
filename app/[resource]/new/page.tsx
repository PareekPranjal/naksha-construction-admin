"use client";

import { notFound, useParams } from "next/navigation";
import { getResource } from "@/lib/resources";
import { ResourceForm } from "@/components/ResourceForm";
import { PageHeader } from "@/components/ui";

export default function NewResourcePage() {
  const params = useParams<{ resource: string }>();
  const resource = getResource(params.resource);
  if (!resource) return notFound();

  return (
    <div>
      <PageHeader title={`New ${resource.label.replace(/s$/, "").toLowerCase()}`} />
      <ResourceForm resource={resource} mode="create" />
    </div>
  );
}
