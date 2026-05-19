// Client-side mirror of the website's SEO cascade so the admin can preview
// what each page will actually render after merging.
//
// Cascade (highest priority wins):
//   1. Per-item SEO    — collection.seo* columns when editing a Project,
//                         Service, Market, Article, etc.
//   2. Page SEO        — the SeoPage row keyed by URL path.
//   3. Item-derived    — sensible fallbacks built from the item itself
//                         (title, summary, cover image…) when admin hasn't
//                         filled in the per-item SEO fields.
//   4. Global defaults — siteName / titleTemplate / defaultDescription, etc.
//
// Keep this in sync with naksha-construction-site/lib/seo.ts
// `generatePageMetadata`. If that file changes, change this one too.

import type { SeoSettings, SeoPage } from "@/app/seo/types";

export type ItemFallback = {
  title?: string;
  description?: string;
  ogImage?: string;
  // Per-item explicit SEO (from the collection edit form). These beat
  // everything except a SeoPage override at the same path.
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoOgImage?: string | null;
  seoKeywords?: string[] | null;
  seoOgTitle?: string | null;
  seoOgDescription?: string | null;
  seoCanonicalUrl?: string | null;
  seoNoIndex?: boolean | null;
  seoNoFollow?: boolean | null;
};

export type Source = "item" | "page" | "fallback" | "global";

export type ResolvedField<T> = { value: T; source: Source };

export type ResolvedSeo = {
  title: ResolvedField<string>;
  fullTitle: ResolvedField<string>; // title with siteName template applied
  description: ResolvedField<string>;
  keywords: ResolvedField<string[]>;
  ogTitle: ResolvedField<string>;
  ogDescription: ResolvedField<string>;
  ogImage: ResolvedField<string>;
  canonicalUrl: ResolvedField<string>;
  noIndex: ResolvedField<boolean>;
  noFollow: ResolvedField<boolean>;
};

function pick<T>(
  candidates: { value: T | null | undefined; source: Source }[],
  fallback: { value: T; source: Source },
): ResolvedField<T> {
  for (const c of candidates) {
    if (c.value !== null && c.value !== undefined && c.value !== "" && !(Array.isArray(c.value) && c.value.length === 0)) {
      return { value: c.value as T, source: c.source };
    }
  }
  return fallback;
}

function applyTemplate(template: string, title: string, siteName: string): string {
  if (!template) return title;
  if (title === siteName) return title;
  return template.replace("%s", title);
}

export function resolveSeo(
  path: string,
  global: SeoSettings,
  page: SeoPage | null,
  item: ItemFallback = {},
): ResolvedSeo {
  const siteName = global.siteName || "Naksha Construction";
  const titleTemplate = global.titleTemplate || `%s | ${siteName}`;
  const baseUrl = (global.siteUrl || "").replace(/\/$/, "");

  const title = pick<string>(
    [
      { value: page?.title ?? null, source: "page" },
      { value: item.seoTitle ?? null, source: "item" },
      { value: item.title ?? null, source: "fallback" },
    ],
    { value: global.defaultTitle || siteName, source: "global" },
  );

  const description = pick<string>(
    [
      { value: page?.description ?? null, source: "page" },
      { value: item.seoDescription ?? null, source: "item" },
      { value: item.description ?? null, source: "fallback" },
    ],
    { value: global.defaultDescription || "", source: "global" },
  );

  const keywords = pick<string[]>(
    [
      { value: page?.keywords?.length ? page.keywords : null, source: "page" },
      { value: item.seoKeywords?.length ? item.seoKeywords : null, source: "item" },
    ],
    { value: global.defaultKeywords ?? [], source: "global" },
  );

  const ogTitle = pick<string>(
    [
      { value: page?.ogTitle ?? null, source: "page" },
      { value: item.seoOgTitle ?? null, source: "item" },
    ],
    { value: title.value, source: title.source },
  );

  const ogDescription = pick<string>(
    [
      { value: page?.ogDescription ?? null, source: "page" },
      { value: item.seoOgDescription ?? null, source: "item" },
    ],
    { value: description.value, source: description.source },
  );

  const ogImage = pick<string>(
    [
      { value: page?.ogImage ?? null, source: "page" },
      { value: item.seoOgImage ?? null, source: "item" },
      { value: item.ogImage ?? null, source: "fallback" },
    ],
    { value: global.defaultOgImage || "", source: "global" },
  );

  const canonicalUrl = pick<string>(
    [
      { value: page?.canonicalUrl ?? null, source: "page" },
      { value: item.seoCanonicalUrl ?? null, source: "item" },
    ],
    { value: baseUrl ? `${baseUrl}${path}` : path, source: "global" },
  );

  const noIndex: ResolvedField<boolean> =
    page?.noIndex
      ? { value: true, source: "page" }
      : item.seoNoIndex
        ? { value: true, source: "item" }
        : { value: false, source: "global" };

  const noFollow: ResolvedField<boolean> =
    page?.noFollow
      ? { value: true, source: "page" }
      : item.seoNoFollow
        ? { value: true, source: "item" }
        : { value: false, source: "global" };

  const fullTitle: ResolvedField<string> = {
    value: applyTemplate(titleTemplate, title.value, siteName),
    source: title.source,
  };

  return {
    title,
    fullTitle,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    canonicalUrl,
    noIndex,
    noFollow,
  };
}

// Paths whose SEO already has a per-item editor in admin (a collection row).
// Used to warn editors before they create a Page SEO row that would compete
// with the per-item SEO source for the same URL.
export type CollectionPathHit = { collection: string; slug: string; editPath: string };

export function detectCollectionPath(path: string): CollectionPathHit | null {
  const m = path.match(/^\/(projects|services|insights)\/([^/]+)\/?$/);
  if (!m) return null;
  const urlSegment = m[1];
  const slug = m[2];
  // Map URL segment → admin resource key (admin uses /articles for /insights).
  const adminKey = urlSegment === "insights" ? "articles" : urlSegment;
  return {
    collection: adminKey,
    slug,
    editPath: `/${adminKey}`,
  };
}
