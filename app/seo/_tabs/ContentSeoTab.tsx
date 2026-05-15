"use client";

import { useEffect, useState } from "react";
import { Wand2, Pencil, CheckCircle2, AlertCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { ImagePicker } from "@/components/ImagePicker";
import { CharCount } from "@/components/CharCount";
import { KeywordsInput } from "@/components/KeywordsInput";
import { SeoPreview } from "@/components/SeoPreview";
import { Tabs } from "@/components/Tabs";
import { cn } from "@/lib/cn";
import type { ContentRow } from "../types";

const COLLECTION_URL_PREFIX: Record<CollectionKey, string> = {
  projects: "/projects",
  services: "/services",
  articles: "/insights",
  markets: "/markets",
};

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
  const [seoKeywords, setSeoKeywords] = useState<string[]>(row.seoKeywords ?? []);
  const [seoOgTitle, setSeoOgTitle] = useState(row.seoOgTitle ?? "");
  const [seoOgDescription, setSeoOgDescription] = useState(row.seoOgDescription ?? "");
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState(row.seoCanonicalUrl ?? "");
  const [seoNoIndex, setSeoNoIndex] = useState(Boolean(row.seoNoIndex));
  const [seoNoFollow, setSeoNoFollow] = useState(Boolean(row.seoNoFollow));
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
        seoKeywords,
        seoOgTitle: seoOgTitle || null,
        seoOgDescription: seoOgDescription || null,
        seoCanonicalUrl: seoCanonicalUrl || null,
        seoNoIndex,
        seoNoFollow,
      });
      await onSaved();
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else if (e instanceof Error) setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const previewPath = `${COLLECTION_URL_PREFIX[collection]}/${row.slug}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-rule w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-rule px-5 py-3 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold">Edit SEO — {row.title}</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink text-sm">
            Close
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5">
          <div className="space-y-4">
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
          <Field label="SEO keywords" help='Comma-separated. Used in <meta name="keywords"> and JSON-LD.'>
            <KeywordsInput
              value={seoKeywords}
              onChange={setSeoKeywords}
              placeholder="construction Jaipur, design-build, …"
            />
          </Field>
          <Field label="OG image" help="1200×630 social share image.">
            <ImagePicker
              value={seoOgImage}
              onChange={(url) => setSeoOgImage(url ?? "")}
              recommendedSize="1200×630px"
            />
          </Field>
          <Field label="OG title" help="Override the share-card title. Defaults to SEO title.">
            <Input value={seoOgTitle} onChange={(e) => setSeoOgTitle(e.target.value)} />
          </Field>
          <Field label="OG description" help="Override the share-card description. Defaults to SEO description.">
            <Textarea
              rows={2}
              value={seoOgDescription}
              onChange={(e) => setSeoOgDescription(e.target.value)}
            />
          </Field>
          <Field label="Canonical URL" help="Absolute URL. Leave blank to use the page's own URL.">
            <Input
              value={seoCanonicalUrl}
              onChange={(e) => setSeoCanonicalUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={seoNoIndex}
                onChange={(e) => setSeoNoIndex(e.target.checked)}
              />
              <span>
                Hide from search engines{" "}
                <span className="text-muted text-xs">(noindex)</span>
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={seoNoFollow}
                onChange={(e) => setSeoNoFollow(e.target.checked)}
              />
              <span>
                Don&apos;t follow links <span className="text-muted text-xs">(nofollow)</span>
              </span>
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {/* Right column: live preview that reacts to in-progress edits. */}
          <div className="lg:sticky lg:top-16 self-start">
            <SeoPreview
              path={previewPath}
              item={{
                title: row.title,
                seoTitle: seoTitle || null,
                seoDescription: seoDescription || null,
                seoOgImage: seoOgImage || null,
                seoKeywords: seoKeywords.length > 0 ? seoKeywords : null,
                seoOgTitle: seoOgTitle || null,
                seoOgDescription: seoOgDescription || null,
                seoCanonicalUrl: seoCanonicalUrl || null,
                seoNoIndex,
                seoNoFollow,
              }}
              title="What this page will render"
            />
          </div>
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
