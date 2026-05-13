export type InternalDocType =
  | "page"
  | "project"
  | "service"
  | "market"
  | "article"
  | "job"
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
    case "market":
      return `/markets/${slug}`;
    case "article":
      return `/insights/${slug}`;
    case "job":
      return `/careers/${slug}`;
    case "location":
      return `/locations/${slug}`;
  }
}

export const INTERNAL_DOC_TYPE_LABELS: Record<InternalDocType, string> = {
  page: "Pages",
  project: "Projects",
  service: "Services",
  market: "Markets",
  article: "Insights",
  job: "Careers",
  location: "Locations",
};
