"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowUpRight, Plus, Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { ImagePicker } from "@/components/ImagePicker";
import { CharCount } from "@/components/CharCount";
import { PrimaryKeywordInput } from "@/components/PrimaryKeywordInput";
import { SecondaryKeywordsInput } from "@/components/SecondaryKeywordsInput";
import { SeoPreview } from "@/components/SeoPreview";
import { useConfirm } from "@/components/Confirm";
import { detectCollectionPath } from "@/lib/seoResolve";
import type { SeoPage } from "../types";

// Shape of a CMS Page row, only the SEO-relevant fields. We union these with
// SeoPage rows so the SEO tab can list every page even before someone created
// an override; editing one creates the missing peer via the backend mirror.
type PageRowSeo = {
  id: string;
  path: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoOgImage: string | null;
  seoRobots: string | null;
  seoCanonical: string | null;
  seoKeywords: string | null;
  seoPrimaryKeyword: string | null;
  seoSecondaryKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
};

type Row = {
  path: string;
  seo: SeoPage | null;
  page: PageRowSeo | null;
  // Display values — prefer the SeoPage values, fall back to the Page row's.
  title: string;
  description: string;
  noIndex: boolean;
};

function flagsFromRobots(robots: string | null): { noIndex: boolean; noFollow: boolean } {
  const v = (robots ?? "").toLowerCase();
  return { noIndex: v.includes("noindex"), noFollow: v.includes("nofollow") };
}

function csv(s: string | null): string[] {
  return (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);
}

// Build a draft from a Page row when no SeoPage exists yet so the editor
// opens pre-filled with the Page's current SEO instead of blank.
function pageRowToDraft(p: PageRowSeo): Omit<SeoPage, "id"> {
  const flags = flagsFromRobots(p.seoRobots);
  return {
    path: p.path,
    title: p.seoTitle ?? "",
    description: p.seoDescription ?? "",
    keywords: csv(p.seoKeywords),
    primaryKeyword: p.seoPrimaryKeyword ?? "",
    secondaryKeywords: csv(p.seoSecondaryKeywords),
    ogTitle: p.ogTitle ?? "",
    ogDescription: p.ogDescription ?? "",
    ogImage: p.seoOgImage ?? "",
    canonicalUrl: p.seoCanonical ?? "",
    noIndex: flags.noIndex,
    noFollow: flags.noFollow,
  };
}

const QUICK_ADD_PATHS = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/contact",
  "/locations",
  "/legal/privacy",
  "/legal/terms",
];

const EMPTY_DRAFT: Omit<SeoPage, "id"> = {
  path: "",
  title: "",
  description: "",
  keywords: [],
  primaryKeyword: "",
  secondaryKeywords: [],
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  canonicalUrl: "",
  noIndex: false,
  noFollow: false,
};

export function PageSeoTab() {
  const confirm = useConfirm();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SeoPage | null>(null);
  const [draft, setDraft] = useState<Omit<SeoPage, "id"> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const [seoRes, pageRes] = await Promise.all([
        api.get<{ pages: SeoPage[] }>("/api/seo/pages"),
        api.get<PageRowSeo[]>("/pages").catch(() => [] as PageRowSeo[]),
      ]);
      // Merge SeoPage rows + Page records by path. Each unique path becomes a
      // single row in the table; editing one writes to SeoPage (and the
      // backend mirrors the change back to the Page record).
      const byPath = new Map<string, Row>();
      for (const p of pageRes) {
        const flags = flagsFromRobots(p.seoRobots);
        byPath.set(p.path, {
          path: p.path,
          seo: null,
          page: p,
          title: p.seoTitle ?? "",
          description: p.seoDescription ?? "",
          noIndex: flags.noIndex,
        });
      }
      for (const s of seoRes.pages) {
        const prev = byPath.get(s.path);
        byPath.set(s.path, {
          path: s.path,
          seo: s,
          page: prev?.page ?? null,
          title: s.title ?? prev?.title ?? "",
          description: s.description ?? prev?.description ?? "",
          noIndex: s.noIndex,
        });
      }
      const merged = [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
      setRows(merged);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startCreate(prefilledPath = "") {
    setEditing(null);
    setDraft({ ...EMPTY_DRAFT, path: prefilledPath });
  }
  function startEdit(row: Row) {
    if (row.seo) {
      setEditing(row.seo);
      const legacy = row.seo.keywords ?? [];
      setDraft({
        ...row.seo,
        keywords: legacy,
        primaryKeyword: row.seo.primaryKeyword ?? legacy[0] ?? "",
        secondaryKeywords:
          row.seo.secondaryKeywords?.length ? row.seo.secondaryKeywords : legacy.slice(1),
      });
      return;
    }
    // Page-only row: open the modal pre-filled with the Page's SEO so the
    // editor isn't typing into a blank form. Saving creates a SeoPage and
    // the backend mirrors any changes back into the Page record.
    setEditing(null);
    setDraft(row.page ? pageRowToDraft(row.page) : { ...EMPTY_DRAFT, path: row.path });
  }
  function cancelEdit() {
    setEditing(null);
    setDraft(null);
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      // Keep the legacy `keywords` column in sync with [primary, ...secondary]
      // for one release so consumers still reading it stay correct.
      const combined = [draft.primaryKeyword ?? "", ...(draft.secondaryKeywords ?? [])]
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        ...draft,
        keywords: combined,
        primaryKeyword: (draft.primaryKeyword ?? "").trim() || null,
      };
      if (editing) {
        await api.patch(`/api/seo/pages/${editing.id}`, payload);
      } else {
        await api.post(`/api/seo/pages`, payload);
      }
      await refresh();
      cancelEdit();
    } catch (e) {
      if (e instanceof ApiError) setError(typeof e.body === "object" ? JSON.stringify(e.body) : e.message);
      else if (e instanceof Error) setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: SeoPage) {
    const ok = await confirm({
      title: `Delete SEO override for ${p.path}?`,
      message: `Removes the SeoPage row. The page will fall back to global defaults.`,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await api.delete(`/api/seo/pages/${p.id}`);
      await refresh();
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
    }
  }

  const existingPaths = new Set(rows.map((r) => r.path));
  const availableQuickAdd = QUICK_ADD_PATHS.filter((p) => !existingPaths.has(p));

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Path-based SEO overrides
          </h3>
          <Button onClick={() => startCreate()}>
            <Plus className="h-4 w-4" /> New override
          </Button>
        </div>
        <p className="text-xs text-muted mb-4">
          One row per URL path on the site. CMS Pages appear automatically;
          editing here also updates the page&apos;s SEO inside <strong>Pages</strong>.
          Static routes (no CMS Page) get added on first save.
        </p>

        {availableQuickAdd.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted mb-2">Quick-add common paths:</p>
            <div className="flex flex-wrap gap-2">
              {availableQuickAdd.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => startCreate(p)}
                  className="text-xs rounded-md border border-rule px-2 py-1 hover:bg-rule/40"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted py-3">
            No pages found yet. Use the quick-add buttons or click <strong>New override</strong>.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted uppercase tracking-wider">
              <tr>
                <th className="py-2">Path</th>
                <th className="py-2">Source</th>
                <th className="py-2">Title</th>
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Index</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const hit = detectCollectionPath(r.path);
                const sourceLabel = r.seo && r.page
                  ? { text: "synced", tone: "bg-emerald-50 text-emerald-800 border-emerald-200" }
                  : r.seo
                    ? { text: "SEO only", tone: "bg-sky-50 text-sky-800 border-sky-200" }
                    : { text: "Page only", tone: "bg-amber-50 text-amber-800 border-amber-200" };
                return (
                  <tr key={r.path} className="border-t border-rule">
                    <td className="py-2 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        {r.path}
                        {hit && (
                          <span
                            className="rounded-full bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5"
                            title={`This URL is also a ${hit.collection} item — its own SEO wins by default.`}
                          >
                            {hit.collection}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${sourceLabel.tone}`}
                        title={r.page ? `Page id: ${r.page.id}` : undefined}
                      >
                        {sourceLabel.text}
                      </span>
                    </td>
                    <td className="py-2">{r.title || <span className="text-muted">—</span>}</td>
                    <td className="py-2 text-xs text-muted truncate max-w-[280px]">
                      {r.description || "—"}
                    </td>
                    <td className="py-2 text-center text-xs">
                      {r.noIndex ? <span className="text-red-600">noindex</span> : <span className="text-emerald-600">index</span>}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {r.page && (
                        <Link
                          href={`/pages/${r.page.id}`}
                          className="text-muted hover:text-ink p-1.5 inline-flex"
                          title="Open in Pages editor"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      )}
                      <button onClick={() => startEdit(r)} className="text-ink hover:text-accent p-1.5" title="Edit SEO">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {r.seo && (
                        <button onClick={() => remove(r.seo!)} className="text-red-600 hover:text-red-700 p-1.5" title="Remove SEO override">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {draft && (
        <PageEditorModal
          draft={draft}
          setDraft={setDraft}
          onCancel={cancelEdit}
          onSave={save}
          saving={saving}
          isEdit={Boolean(editing)}
        />
      )}
    </div>
  );
}

function PageEditorModal({
  draft,
  setDraft,
  onCancel,
  onSave,
  saving,
  isEdit,
}: {
  draft: Omit<SeoPage, "id">;
  setDraft: (d: Omit<SeoPage, "id">) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  isEdit: boolean;
}) {
  const set = <K extends keyof Omit<SeoPage, "id">>(k: K, v: Omit<SeoPage, "id">[K]) =>
    setDraft({ ...draft, [k]: v });

  const collisionHit = detectCollectionPath(draft.path);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-rule w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-rule px-5 py-3 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold">
            {isEdit ? `Edit SEO for ${draft.path}` : "New page SEO override"}
          </h2>
          <button type="button" onClick={onCancel} className="text-muted hover:text-ink text-sm">
            Close
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5">
          <div className="space-y-4">
          <Field label="Path" help='Must start with "/". e.g. /about, /services/design-build' required>
            <Input value={draft.path} onChange={(e) => set("path", e.target.value)} disabled={isEdit} />
          </Field>

          {collisionHit && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">This URL is a {collisionHit.collection} item.</p>
                <p className="mt-1 text-amber-900/80">
                  The {collisionHit.collection.replace(/s$/, "")}&apos;s own SEO already wins for{" "}
                  <code className="font-mono">{draft.path}</code>. Use this row only to force a different
                  value here, otherwise prefer editing the item directly.
                </p>
                <Link
                  href={collisionHit.editPath}
                  className="mt-1.5 inline-flex items-center gap-1 underline hover:text-amber-700"
                >
                  Open {collisionHit.collection} list <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          <Field label="Title">
            <Input value={draft.title ?? ""} onChange={(e) => set("title", e.target.value)} />
            <div className="mt-1 flex justify-end">
              <CharCount value={draft.title ?? ""} type="title" />
            </div>
          </Field>

          <Field label="Description">
            <Textarea
              rows={3}
              value={draft.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
            />
            <div className="mt-1 flex justify-end">
              <CharCount value={draft.description ?? ""} type="description" />
            </div>
          </Field>

          <Field label="Primary keyword" help="The one focus keyword this page is optimised for.">
            <PrimaryKeywordInput
              value={draft.primaryKeyword ?? ""}
              onChange={(v) => set("primaryKeyword", v)}
            />
          </Field>
          <Field label="Secondary keywords" help="3–5 supporting / LSI variants. Comma-separated.">
            <SecondaryKeywordsInput
              value={draft.secondaryKeywords ?? []}
              onChange={(next) => set("secondaryKeywords", next)}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="OG title">
              <Input value={draft.ogTitle ?? ""} onChange={(e) => set("ogTitle", e.target.value)} />
            </Field>
            <Field label="Canonical URL">
              <Input
                value={draft.canonicalUrl ?? ""}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </div>

          <Field label="OG description">
            <Textarea
              rows={2}
              value={draft.ogDescription ?? ""}
              onChange={(e) => set("ogDescription", e.target.value)}
            />
          </Field>

          <Field label="OG image">
            <ImagePicker
              value={draft.ogImage ?? ""}
              onChange={(url) => set("ogImage", url ?? "")}
              recommendedSize="1200×630px"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.noIndex}
                onChange={(e) => set("noIndex", e.target.checked)}
              />
              noindex
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.noFollow}
                onChange={(e) => set("noFollow", e.target.checked)}
              />
              nofollow
            </label>
          </div>
          </div>

          {/* Right column: live preview, sticky on tall screens. */}
          <div className="lg:sticky lg:top-16 self-start">
            {draft.path?.startsWith("/") ? (
              <SeoPreview
                path={draft.path}
                item={{
                  // Treat the modal's draft as if it were the SeoPage row
                  // already saved, so the editor sees their unsaved changes
                  // reflected in the preview immediately.
                  seoTitle: draft.title ?? null,
                  seoDescription: draft.description ?? null,
                  seoOgImage: draft.ogImage ?? null,
                  seoKeywords:
                    (draft.primaryKeyword ?? "") || draft.secondaryKeywords?.length
                      ? [draft.primaryKeyword ?? "", ...(draft.secondaryKeywords ?? [])].filter(Boolean)
                      : null,
                  seoPrimaryKeyword: draft.primaryKeyword ?? null,
                  seoSecondaryKeywords: draft.secondaryKeywords ?? null,
                  seoOgTitle: draft.ogTitle ?? null,
                  seoOgDescription: draft.ogDescription ?? null,
                  seoCanonicalUrl: draft.canonicalUrl ?? null,
                  seoNoIndex: draft.noIndex ?? null,
                  seoNoFollow: draft.noFollow ?? null,
                }}
                title="What this URL will render"
              />
            ) : (
              <Card className="p-4">
                <p className="text-xs text-muted">
                  Enter a path starting with <code>/</code> to see the live SEO preview.
                </p>
              </Card>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-rule px-5 py-3 flex items-center justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || !draft.path}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
