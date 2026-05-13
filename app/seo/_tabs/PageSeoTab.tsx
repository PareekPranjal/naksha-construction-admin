"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { ImagePicker } from "@/components/ImagePicker";
import { CharCount } from "@/components/CharCount";
import { useConfirm } from "@/components/Confirm";
import type { SeoPage } from "../types";

const QUICK_ADD_PATHS = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/markets",
  "/insights",
  "/careers",
  "/contact",
  "/sustainability",
  "/locations",
  "/legal/privacy",
  "/legal/terms",
];

const EMPTY_DRAFT: Omit<SeoPage, "id"> = {
  path: "",
  title: "",
  description: "",
  keywords: [],
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  canonicalUrl: "",
  noIndex: false,
  noFollow: false,
};

export function PageSeoTab() {
  const confirm = useConfirm();
  const [pages, setPages] = useState<SeoPage[]>([]);
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
      const r = await api.get<{ pages: SeoPage[] }>("/api/seo/pages");
      setPages(r.pages);
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
  function startEdit(p: SeoPage) {
    setEditing(p);
    setDraft({ ...p, keywords: p.keywords ?? [] });
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
      if (editing) {
        await api.patch(`/api/seo/pages/${editing.id}`, draft);
      } else {
        await api.post(`/api/seo/pages`, draft);
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

  const existingPaths = new Set(pages.map((p) => p.path));
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
          Each row controls the SEO of one URL path. Useful for static routes
          (<code>/services</code>, <code>/legal/privacy</code>) that don&apos;t have a CMS Page document.
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
        ) : pages.length === 0 ? (
          <p className="text-sm text-muted py-3">
            No path overrides yet. Use the quick-add buttons or click <strong>New override</strong>.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted uppercase tracking-wider">
              <tr>
                <th className="py-2">Path</th>
                <th className="py-2">Title</th>
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Index</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-t border-rule">
                  <td className="py-2 font-mono text-xs">{p.path}</td>
                  <td className="py-2">{p.title || <span className="text-muted">—</span>}</td>
                  <td className="py-2 text-xs text-muted truncate max-w-[280px]">
                    {p.description || "—"}
                  </td>
                  <td className="py-2 text-center text-xs">
                    {p.noIndex ? <span className="text-red-600">noindex</span> : <span className="text-emerald-600">index</span>}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(p)} className="text-ink hover:text-accent p-1.5" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(p)} className="text-red-600 hover:text-red-700 p-1.5" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-rule w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-rule px-5 py-3 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold">
            {isEdit ? `Edit SEO for ${draft.path}` : "New page SEO override"}
          </h2>
          <button type="button" onClick={onCancel} className="text-muted hover:text-ink text-sm">
            Close
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Path" help='Must start with "/". e.g. /about, /services/design-build' required>
            <Input value={draft.path} onChange={(e) => set("path", e.target.value)} disabled={isEdit} />
          </Field>

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

          <Field label="Keywords" help="Comma-separated.">
            <Input
              value={(draft.keywords ?? []).join(", ")}
              onChange={(e) =>
                set(
                  "keywords",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
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
