"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";
import { ImagePicker } from "./ImagePicker";
import { BlocksEditor } from "./BlocksEditor";
import { SeoPreview } from "./SeoPreview";
import { useConfirm } from "./Confirm";
import type { PageDoc } from "@/lib/types";

type Block = Record<string, unknown> & { type: string };

type Props = { mode: "create" | "edit"; initial?: PageDoc };

type Seo = {
  seoTitle: string;
  seoDescription: string;
  seoOgImage: string;
  seoKeywords: string;
  seoRobots: string;
  seoCanonical: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
};

const EMPTY_SEO: Seo = {
  seoTitle: "",
  seoDescription: "",
  seoOgImage: "",
  seoKeywords: "",
  seoRobots: "",
  seoCanonical: "",
  ogTitle: "",
  ogDescription: "",
  ogType: "",
  twitterCard: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
};

function loadSeo(p: Record<string, unknown> = {}): Seo {
  const get = (k: string) => {
    const v = p[k];
    return typeof v === "string" ? v : "";
  };
  return {
    seoTitle: get("seoTitle"),
    seoDescription: get("seoDescription"),
    seoOgImage: get("seoOgImage"),
    seoKeywords: get("seoKeywords"),
    seoRobots: get("seoRobots"),
    seoCanonical: get("seoCanonical"),
    ogTitle: get("ogTitle"),
    ogDescription: get("ogDescription"),
    ogType: get("ogType"),
    twitterCard: get("twitterCard"),
    twitterTitle: get("twitterTitle"),
    twitterDescription: get("twitterDescription"),
    twitterImage: get("twitterImage"),
  };
}

// Shape of the SeoPage row returned by /api/seo/pages/:path. The Pages-form
// SEO section is synced with this row so editors can use either surface.
type SeoPageRow = {
  id: string;
  path: string;
  title: string | null;
  description: string | null;
  keywords: string[] | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
};

function robotsFromFlags(noIndex: boolean, noFollow: boolean): string {
  return `${noIndex ? "noindex" : "index"},${noFollow ? "nofollow" : "follow"}`;
}

function flagsFromRobots(robots: string): { noIndex: boolean; noFollow: boolean } {
  const v = (robots || "").toLowerCase();
  return { noIndex: v.includes("noindex"), noFollow: v.includes("nofollow") };
}

// Merge a SeoPage row into the PageForm SEO state. SeoPage values win when
// non-empty so the SEO admin's Page SEO row is the source of truth for the
// fields it covers.
function mergeSeoPageInto(seo: Seo, row: SeoPageRow): Seo {
  const next = { ...seo };
  if (row.title) next.seoTitle = row.title;
  if (row.description) next.seoDescription = row.description;
  if (row.ogImage) next.seoOgImage = row.ogImage;
  if (row.keywords && row.keywords.length > 0) next.seoKeywords = row.keywords.join(", ");
  if (row.canonicalUrl) next.seoCanonical = row.canonicalUrl;
  if (row.noIndex || row.noFollow) {
    next.seoRobots = robotsFromFlags(row.noIndex, row.noFollow);
  }
  if (row.ogTitle) next.ogTitle = row.ogTitle;
  if (row.ogDescription) next.ogDescription = row.ogDescription;
  return next;
}

// Build the SeoPage upsert payload from PageForm SEO state.
function seoToSeoPagePayload(seo: Seo) {
  const flags = flagsFromRobots(seo.seoRobots);
  const keywords = seo.seoKeywords
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    title: seo.seoTitle || null,
    description: seo.seoDescription || null,
    keywords,
    ogTitle: seo.ogTitle || null,
    ogDescription: seo.ogDescription || null,
    ogImage: seo.seoOgImage || null,
    canonicalUrl: seo.seoCanonical || null,
    noIndex: flags.noIndex,
    noFollow: flags.noFollow,
  };
}

export function PageForm({ mode, initial }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [key, setKey] = useState(initial?.key ?? "");
  const [path, setPath] = useState(initial?.path ?? "/");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [blocks, setBlocks] = useState<Block[]>(
    Array.isArray(initial?.blocks) ? (initial.blocks as Block[]) : [],
  );
  const [seo, setSeo] = useState<Seo>(loadSeo((initial ?? {}) as Record<string, unknown>));
  const [seoPageSynced, setSeoPageSynced] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorBody, setErrorBody] = useState<unknown>(null);

  useEffect(() => {
    if (initial) {
      setKey(initial.key);
      setPath(initial.path);
      setTitle(initial.title);
      setBlocks(Array.isArray(initial.blocks) ? (initial.blocks as Block[]) : []);
      setSeo(loadSeo(initial as unknown as Record<string, unknown>));
    }
  }, [initial?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pull the matching SeoPage row (path-keyed) and merge its values into the
  // SEO section so editors see what was set in /seo → Page SEO. SeoPage wins
  // when it has a value for an overlapping field.
  useEffect(() => {
    if (!path || !path.startsWith("/")) {
      setSeoPageSynced(false);
      return;
    }
    let cancelled = false;
    api
      .get<{ page: SeoPageRow | null }>(`/api/seo/pages/${encodeURIComponent(path)}`)
      .then((r) => {
        if (cancelled || !r?.page) {
          if (!cancelled) setSeoPageSynced(false);
          return;
        }
        setSeo((s) => mergeSeoPageInto(s, r.page!));
        setSeoPageSynced(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [path]);

  const setSeoField = (k: keyof Seo, v: string) => setSeo((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    setErrorBody(null);
    const blanksToNull = Object.fromEntries(
      Object.entries(seo).map(([k, v]) => [k, v === "" ? null : v]),
    );
    const payload = {
      key,
      path,
      title,
      blocks,
      ...blanksToNull,
    };
    try {
      if (mode === "create") await api.post("/pages", payload);
      else if (initial) await api.patch(`/pages/${initial.id}`, payload);

      // Mirror the SEO subset to the SeoPage row keyed by path so the SEO
      // admin's Page SEO tab reflects what was just saved here. The website
      // resolver also reads SeoPage as the per-path layer of the cascade.
      if (path && path.startsWith("/")) {
        try {
          await api.put(`/api/seo/pages/by-path/${encodeURIComponent(path)}`, seoToSeoPagePayload(seo));
        } catch (e) {
          // Non-fatal: the Page row was saved. Surface the error but don't
          // block navigation, since SEO admin can repair the SeoPage row.
          console.warn("SeoPage sync failed:", e);
        }
      }

      router.push("/pages");
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        setErrorBody(e.body);
      } else if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!initial) return;
    const ok = await confirm({
      title: `Delete the "${initial.title}" page?`,
      message: `This permanently removes ${initial.path} and all its blocks. This cannot be undone.`,
      confirmLabel: "Delete page",
      typeToConfirm: initial.title,
    });
    if (!ok) return;
    await api.delete(`/pages/${initial.id}`);
    router.push("/pages");
    router.refresh();
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Page</h3>
        <Field label="Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Key" required help="Stable id, e.g. 'home', 'about'.">
          <Input value={key} onChange={(e) => setKey(e.target.value)} />
        </Field>
        <Field label="URL path" required help="Must start with /">
          <Input value={path} onChange={(e) => setPath(e.target.value)} placeholder="/about" />
        </Field>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Page blocks
          </h3>
          <span className="text-xs text-muted">
            {blocks.length} block{blocks.length === 1 ? "" : "s"}
          </span>
        </div>
        <BlocksEditor value={blocks} onChange={setBlocks} />
      </Card>

      {path && path.startsWith("/") && (
        <SeoPreview
          path={path}
          item={{
            title,
            seoTitle: seo.seoTitle || null,
            seoDescription: seo.seoDescription || null,
            seoOgImage: seo.seoOgImage || null,
            seoKeywords: seo.seoKeywords
              ? seo.seoKeywords.split(",").map((s) => s.trim()).filter(Boolean)
              : null,
            seoOgTitle: seo.ogTitle || null,
            seoOgDescription: seo.ogDescription || null,
            seoCanonicalUrl: seo.seoCanonical || null,
            seoNoIndex: flagsFromRobots(seo.seoRobots).noIndex,
            seoNoFollow: flagsFromRobots(seo.seoRobots).noFollow,
          }}
        />
      )}

      <Card className="p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">SEO — basics</h3>
          {seoPageSynced && (
            <span
              className="text-[11px] text-emerald-700"
              title="Values shown here include the SeoPage row from SEO → Page SEO. Saving here updates both surfaces."
            >
              ✓ synced with SEO admin
            </span>
          )}
        </div>
        <p className="text-xs text-muted">
          These fields are mirrored to <strong>SEO → Page SEO</strong> for{" "}
          <code className="font-mono">{path || "/"}</code>. Editing here also updates that row, so
          both surfaces always show the same values.
        </p>
        <Field label="Meta title" help="Falls back to the page title when empty.">
          <Input value={seo.seoTitle} onChange={(e) => setSeoField("seoTitle", e.target.value)} />
        </Field>
        <Field label="Meta description" help="Recommended 50–160 characters.">
          <Textarea
            value={seo.seoDescription}
            onChange={(e) => setSeoField("seoDescription", e.target.value)}
          />
        </Field>
        <Field label="Share image (OG)" help="Used for social previews.">
          <ImagePicker
            value={seo.seoOgImage}
            onChange={(url) => setSeoField("seoOgImage", url ?? "")}
            recommendedSize="1200×630px (social share)"
          />
        </Field>
      </Card>

      <Card className="p-5 space-y-4">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="w-full flex items-baseline justify-between text-left"
        >
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
            SEO — advanced
          </h3>
          <span className="text-xs text-muted">{advancedOpen ? "Hide" : "Show"}</span>
        </button>
        {advancedOpen && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Keywords" help="Comma-separated. Most engines ignore, but harmless.">
                <Input
                  value={seo.seoKeywords}
                  onChange={(e) => setSeoField("seoKeywords", e.target.value)}
                  placeholder="construction, rajasthan, jaipur"
                />
              </Field>
              <Field label="Robots" help='e.g. "index,follow" or "noindex,nofollow"'>
                <Input
                  value={seo.seoRobots}
                  onChange={(e) => setSeoField("seoRobots", e.target.value)}
                  placeholder="index,follow"
                />
              </Field>
            </div>
            <Field label="Canonical URL" help="Override the canonical when this page is syndicated.">
              <Input
                value={seo.seoCanonical}
                onChange={(e) => setSeoField("seoCanonical", e.target.value)}
                placeholder="https://nakshaconstruction.example/about"
              />
            </Field>

            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider pt-2">
              Open Graph (Facebook / LinkedIn)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="OG title">
                <Input value={seo.ogTitle} onChange={(e) => setSeoField("ogTitle", e.target.value)} />
              </Field>
              <Field label="OG type">
                <Select value={seo.ogType} onChange={(e) => setSeoField("ogType", e.target.value)}>
                  <option value="">website (default)</option>
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="profile">profile</option>
                  <option value="product">product</option>
                </Select>
              </Field>
            </div>
            <Field label="OG description">
              <Textarea
                value={seo.ogDescription}
                onChange={(e) => setSeoField("ogDescription", e.target.value)}
              />
            </Field>

            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider pt-2">
              Twitter / X
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Card type">
                <Select
                  value={seo.twitterCard}
                  onChange={(e) => setSeoField("twitterCard", e.target.value)}
                >
                  <option value="">summary_large_image (default)</option>
                  <option value="summary">summary</option>
                  <option value="summary_large_image">summary_large_image</option>
                </Select>
              </Field>
              <Field label="Twitter title">
                <Input
                  value={seo.twitterTitle}
                  onChange={(e) => setSeoField("twitterTitle", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Twitter description">
              <Textarea
                value={seo.twitterDescription}
                onChange={(e) => setSeoField("twitterDescription", e.target.value)}
              />
            </Field>
            <Field label="Twitter image">
              <ImagePicker
                value={seo.twitterImage}
                onChange={(url) => setSeoField("twitterImage", url ?? "")}
                recommendedSize="1200×630px (Twitter large card)"
              />
            </Field>
          </div>
        )}
      </Card>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
          {errorBody !== null && (
            <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(errorBody, null, 2)}</pre>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button onClick={submit} disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
        </Button>
        <Button variant="secondary" onClick={() => router.back()} type="button">
          Cancel
        </Button>
        {mode === "edit" && (
          <Button variant="danger" onClick={onDelete} type="button" className="ml-auto">
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

export { EMPTY_SEO };
