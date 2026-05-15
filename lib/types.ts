export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "slug"
  | "select"
  | "image"
  | "imageWithAlt"
  | "imageArray"
  | "stringArray"
  | "keywords"
  | "boolean"
  | "json";

export type FieldDef = {
  name: string;
  label?: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // for select
  placeholder?: string;
  help?: string;
  group?: "main" | "seo" | "meta";
  /** For image / imageArray fields — shown as a hint to editors. */
  recommendedSize?: string;
};

export type ResourceDef = {
  key: string; // url segment, e.g. "projects"
  label: string; // sidebar label
  apiPath: string; // backend path e.g. "/projects"
  identifier: "id" | "slug";
  listColumns: string[]; // field names shown in the list table
  fields: FieldDef[];
};

export type MediaAsset = {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  alt: string;
  tags: string[];
  folder: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PageDoc = {
  id: string;
  key: string;
  path: string;
  title: string;
  blocks: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  seoOgImage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GlobalDoc = {
  id: string;
  key: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
};

export type Redirect = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  createdAt: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  meta: Record<string, unknown>;
  createdAt: string;
};
