"use client";

import { useEffect, useState } from "react";
import { Wand2, Pencil, CheckCircle2, AlertCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { ImagePicker } from "@/components/ImagePicker";
import { CharCount } from "@/components/CharCount";
import { Tabs } from "@/components/Tabs";
import { cn } from "@/lib/cn";
import type { ContentRow } from "../types";

type CollectionKey = "projects" | "services" | "articles" | "markets";

const COLLECTION_TABS: { id: CollectionKey; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "services", label: "Services" },
  { id: "articles", label: "Articles" },
  { id: "markets", label: "Markets" },
];

type ContentMap = Record<CollectionKey, ContentRow[]>;

const EMPTY_CONTENT: ContentMap = {
  projects: [],
  services: [],
  articles: [],
  markets: [],
};

export function ContentSeoTab() {
  const [active, setActive] = useState<CollectionKey>("projects");
  const [data, setData] = useState<ContentMap>(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [editing, setEditing] = useState<{ collection: CollectionKey; row: ContentRow } | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.get<ContentMap>("/api/seo/content");
      setData(r);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function bulkGenerate() {
    setRunning(true);
    setError(null);
    try {
      await api.post("/api/seo/bulk-generate");
      await refresh();
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  const rows = data[active] ?? [];
  const total = rows.length;
  const optimized = rows.filter((r) => r.hasSEO).length;
  const pct = total === 0 ? 0 : Math.round((optimized / total) * 100);

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Content coverage
          </h3>
          <Button onClick={bulkGenerate} disabled={running}>
            <Wand2 className="h-4 w-4" />
            {running ? "Generating…" : "Auto-Generate Missing SEO"}
          </Button>
        </div>
        <p className="text-xs text-muted mb-4">
          Auto-generate fills in title (item name | site name) and description (first 155 chars of body)
          for any item that lacks them. Already-optimized items are not touched.
        </p>

        <Tabs
          tabs={COLLECTION_TABS.map((c) => ({ id: c.id, label: c.label }))}
          active={active}
          onChange={(id) => setActive(id as CollectionKey)}
        />

        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-medium">
              {optimized} of {total} optimized
            </span>
            <span className="text-xs text-muted">{pct}%</span>
          </div>
          <div className="h-2 w-full bg-rule rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted py-3">No items in this collection yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted uppercase tracking-wider">
              <tr>
                <th className="py-2">Title</th>
                <th className="py-2">Status</th>
                <th className="py-2">SEO title</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-rule">
                  <td className="py-2 font-medium">{r.title}</td>
                  <td className="py-2">
                    {r.hasSEO ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Optimized
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="h-3.5 w-3.5" /> Missing
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-xs text-muted truncate max-w-[280px]">
                    {r.seoTitle || "—"}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => setEditing({ collection: active, row: r })}
                      className="text-ink hover:text-accent p-1.5"
                      title="Edit SEO"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {editing && (
        <ContentSeoModal
          collection={editing.collection}
          row={editing.row}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

function ContentSeoModal({
  collection,
  row,
  onClose,
  onSaved,
}: {
  collection: CollectionKey;
  row: ContentRow;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [seoTitle, setSeoTitle] = useState(row.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(row.seoDescription ?? "");
  const [seoOgImage, setSeoOgImage] = useState(row.seoOgImage ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/api/seo/${collection}/${row.id}`, {
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoOgImage: seoOgImage || null,
      });
      await onSaved();
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else if (e instanceof Error) setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-rule w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-rule px-5 py-3 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold">Edit SEO — {row.title}</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink text-sm">
            Close
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="SEO title">
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            <div className="mt-1 flex justify-end">
              <CharCount value={seoTitle} type="title" />
            </div>
          </Field>
          <Field label="SEO description">
            <Textarea
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
            <div className="mt-1 flex justify-end">
              <CharCount value={seoDescription} type="description" />
            </div>
          </Field>
          <Field label="OG image" help="1200×630 social share image.">
            <ImagePicker
              value={seoOgImage}
              onChange={(url) => setSeoOgImage(url ?? "")}
              recommendedSize="1200×630px"
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="sticky bottom-0 bg-white border-t border-rule px-5 py-3 flex items-center justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
