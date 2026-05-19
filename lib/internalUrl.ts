export type InternalDocType =
  | "page"
  | "project"
  | "service"
  | "article"
  | "location";

export type InternalDocRef = {
  id: string;
  type: InternalDocType;
  title: string;
  slug: string;
  url: string;
};

export function buildInternalUrl(type: InternalDocType, slug: string, pagePath?: string): string {
  switch (type) {
    case "page":
      return pagePath ?? `/${slug}`;
    case "project":
      return `/projects/${slug}`;
    case "service":
      return `/services/${slug}`;
    case "article":
      return `/insights/${slug}`;
    case "location":
      return `/locations/${slug}`;
  }
}

export const INTERNAL_DOC_TYPE_LABELS: Record<InternalDocType, string> = {
  page: "Pages",
  project: "Projects",
  service: "Services",
  article: "Insights",
  location: "Locations",
};
