"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Globe, Pencil, RefreshCw, Settings as SettingsIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Card } from "./ui";
import { cn } from "@/lib/cn";
import { resolveSeo, type ItemFallback, type ResolvedField, type Source } from "@/lib/seoResolve";
import type { SeoPage, SeoSettings } from "@/app/seo/types";

// Renders the resolved SEO for a path, fetching globalSEO + the matching
// SeoPage row and merging them with any in-progress per-item overrides the
// editor is currently typing. Updates live as `item` changes.

const SOURCE_META: Record<Source, { label: string; tone: string; Icon: React.ComponentType<{ className?: string }> }> = {
  item: {
    label: "from this item's SEO",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Icon: Pencil,
  },
  page: {
    label: "from Page SEO override",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
    Icon: Globe,
  },
  fallback: {
    label: "auto-generated from item",
    tone: "bg-sky-50 text-sky-700 border-sky-200",
    Icon: RefreshCw,
  },
  global: {
    label: "from Global Settings",
    tone: "bg-rule/40 text-ink/70 border-rule",
    Icon: SettingsIcon,
  },
};

function SourceBadge({ source }: { source: Source }) {
  const { label, tone, Icon } = SOURCE_META[source];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
        tone,
      )}
      title={label}
    >
      <Icon className="h-2.5 w-2.5" />
      {source}
    </span>
  );
}

function Row({
  label,
  field,
  emptyText,
  children,
}: {
  label: string;
  field: ResolvedField<unknown>;
  emptyText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-3">
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-xs font-medium text-muted">{label}</span>
        <SourceBadge source={field.source} />
      </div>
      <div className="min-w-0 text-sm text-ink break-words">
        {children || <span className="text-muted italic">{emptyText ?? "—"}</span>}
      </div>
    </div>
  );
}

type Props = {
  /** URL path on the website, e.g. "/projects/aravalli-tech-park". */
  path: string;
  /** In-progress per-item SEO + content fallbacks. Updates trigger a re-merge. */
  item?: ItemFallback;
  /** Optional title override for the panel. */
  title?: string;
};

export function SeoPreview({ path, item, title = "Live SEO preview" }: Props) {
  const [global, setGlobal] = useState<SeoSettings | null>(null);
  const [page, setPage] = useState<SeoPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get<{ settings: SeoSettings }>("/api/seo/global").catch((e) => {
        if (e instanceof ApiError && e.status !== 404) setError(e.message);
        return null;
      }),
      api
        .get<{ page: SeoPage | null }>(`/api/seo/pages/${encodeURIComponent(path)}`)
        .catch(() => ({ page: null })),
    ])
      .then(([g, p]) => {
        if (cancelled) return;
        if (g?.settings) setGlobal(g.settings);
        setPage(p?.page ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-xs text-muted">Loading SEO preview…</p>
      </Card>
    );
  }
  if (!global) {
    return (
      <Card className="p-4">
        <p className="text-xs text-red-600">{error ?? "Could not load global SEO."}</p>
      </Card>
    );
  }

  const resolved = resolveSeo(path, global, page, item);

  return (
    <Card className="p-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <a
            href={`${(global.siteUrl || "").replace(/\/$/, "")}${path}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
          >
            <ExternalLink className="h-3 w-3" /> open
          </a>
        </div>
        <p className="font-mono text-[11px] text-muted">{path}</p>
      </div>

      {/* Search-result style preview */}
      <div className="rounded-md border border-rule p-3 space-y-1">
        <p className="text-[11px] text-muted truncate">{resolved.canonicalUrl.value}</p>
        <p className="text-base text-blue-700 font-medium leading-tight line-clamp-2">
          {resolved.fullTitle.value}
        </p>
        <p className="text-xs text-ink/70 leading-snug line-clamp-3">
          {resolved.description.value || (
            <span className="italic text-muted">No description set.</span>
          )}
        </p>
      </div>

      {/* Per-field source breakdown */}
      <div className="space-y-2">
        <Row label="Title" field={resolved.fullTitle}>
          {resolved.fullTitle.value}
        </Row>
        <Row label="Description" field={resolved.description}>
          {resolved.description.value}
        </Row>
        <Row label="Primary" field={resolved.primaryKeyword} emptyText="not set">
          {resolved.primaryKeyword.value ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              {resolved.primaryKeyword.value}
            </span>
          ) : null}
        </Row>
        <Row label="Secondary" field={resolved.secondaryKeywords} emptyText="none">
          {resolved.secondaryKeywords.value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {resolved.secondaryKeywords.value.map((k, i) => (
                <span key={i} className="rounded-full bg-rule/40 px-2 py-0.5 text-[11px]">
                  {k}
                </span>
              ))}
            </div>
          ) : null}
        </Row>
        <Row label="All keywords (legacy)" field={resolved.keywords} emptyText="none">
          {resolved.keywords.value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {resolved.keywords.value.map((k, i) => (
                <span key={i} className="rounded-full bg-rule/40 px-2 py-0.5 text-[11px]">
                  {k}
                </span>
              ))}
            </div>
          ) : null}
        </Row>
        <Row label="OG title" field={resolved.ogTitle}>
          {resolved.ogTitle.value}
        </Row>
        <Row label="OG description" field={resolved.ogDescription}>
          {resolved.ogDescription.value}
        </Row>
        <Row label="OG image" field={resolved.ogImage} emptyText="none">
          {resolved.ogImage.value ? (
            <a
              href={resolved.ogImage.value}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs underline"
            >
              {resolved.ogImage.value.replace(/^https?:\/\//, "").slice(0, 60)}…
            </a>
          ) : null}
        </Row>
        <Row label="Canonical" field={resolved.canonicalUrl}>
          {resolved.canonicalUrl.value}
        </Row>
        <Row label="Robots" field={resolved.noIndex}>
          {resolved.noIndex.value ? (
            <span className="text-red-600">noindex</span>
          ) : (
            <span className="text-emerald-700">index</span>
          )}
          {", "}
          {resolved.noFollow.value ? (
            <span className="text-red-600">nofollow</span>
          ) : (
            <span className="text-emerald-700">follow</span>
          )}
        </Row>
      </div>

      <p className="text-[11px] text-muted leading-relaxed border-t border-rule pt-3">
        Cascade for this URL:{" "}
        <span className="font-medium text-ink">Per-item SEO</span> →{" "}
        <span className="font-medium text-ink">Page SEO override</span> →{" "}
        <span className="font-medium text-ink">Auto fallback</span> →{" "}
        <span className="font-medium text-ink">Global defaults</span>. The first set value wins.
      </p>
    </Card>
  );
}
