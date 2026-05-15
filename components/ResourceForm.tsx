"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ResourceDef, FieldDef } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";
import { ImagePicker } from "./ImagePicker";
import { ImageArrayPicker } from "./ImageArrayPicker";
import { TagsInput } from "./TagsInput";
import { KeywordsInput } from "./KeywordsInput";
import { RichTextEditor } from "./RichTextEditor";
import { useConfirm } from "./Confirm";

type Props = {
  resource: ResourceDef;
  initial?: Record<string, unknown>;
  mode: "create" | "edit";
  id?: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function defaultValue(f: FieldDef): unknown {
  switch (f.type) {
    case "number":
      return 0;
    case "stringArray":
    case "imageArray":
    case "keywords":
      return [];
    case "boolean":
      return false;
    case "json":
      return {};
    case "select":
      return f.options?.[0] ?? "";
    default:
      return "";
  }
}

// `imageWithAlt` fields are declared once but back two columns: <name> for the
// URL and <name>Alt for the alt text. This helper hydrates both keys from the
// initial payload so the form doesn't drop the alt value on edit.
function altKey(name: string): string {
  return `${name}Alt`;
}

function buildInitialValues(
  fields: FieldDef[],
  initial: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  for (const f of fields) {
    v[f.name] = initial?.[f.name] ?? defaultValue(f);
    if (f.type === "imageWithAlt") {
      v[altKey(f.name)] = initial?.[altKey(f.name)] ?? "";
    }
  }
  return v;
}

export function ResourceForm({ resource, initial, mode, id }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    buildInitialValues(resource.fields, initial),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorBody, setErrorBody] = useState<unknown>(null);

  useEffect(() => {
    if (initial) setValues(buildInitialValues(resource.fields, initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  const set = (name: string, val: unknown) => setValues((v) => ({ ...v, [name]: val }));

  const titleField = resource.fields.find((f) => f.name === "title" || f.name === "name");
  const slugField = resource.fields.find((f) => f.name === "slug");

  const onTitleBlur = () => {
    if (
      mode === "create" &&
      slugField &&
      titleField &&
      typeof values[slugField.name] === "string" &&
      !values[slugField.name] &&
      typeof values[titleField.name] === "string"
    ) {
      set(slugField.name, slugify(values[titleField.name] as string));
    }
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    setErrorBody(null);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of resource.fields) {
        let v = values[f.name];
        if (f.type === "number" && typeof v === "string") v = v === "" ? 0 : Number(v);
        if (f.type === "boolean") v = Boolean(v);
        if (v === "" && !f.required) v = null;
        payload[f.name] = v;
        // imageWithAlt: also serialize the companion alt-text column.
        if (f.type === "imageWithAlt") {
          const a = values[altKey(f.name)];
          payload[altKey(f.name)] = typeof a === "string" && a.length > 0 ? a : null;
        }
      }
      if (mode === "create") {
        await api.post(resource.apiPath, payload);
      } else if (id) {
        await api.patch(`${resource.apiPath}/${id}`, payload);
      }
      router.push(`/${resource.key}`);
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
    if (!id) return;
    const label =
      (titleField && typeof values[titleField.name] === "string"
        ? (values[titleField.name] as string)
        : "") || "";
    const ok = await confirm({
      title: label ? `Delete "${label}"?` : "Delete this item?",
      message: "This permanently removes the record. This cannot be undone.",
      confirmLabel: "Delete",
      typeToConfirm: label || undefined,
    });
    if (!ok) return;
    try {
      await api.delete(`${resource.apiPath}/${id}`);
      router.push(`/${resource.key}`);
      router.refresh();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
  };

  const grouped = {
    main: resource.fields.filter((f) => !f.group || f.group === "main"),
    seo: resource.fields.filter((f) => f.group === "seo"),
    meta: resource.fields.filter((f) => f.group === "meta"),
  };

  const renderField = (f: FieldDef) => {
    const v = values[f.name];
    const common = { id: f.name, name: f.name };
    switch (f.type) {
      case "text":
      case "slug":
        return (
          <Input
            {...common}
            value={(v as string) ?? ""}
            onChange={(e) => set(f.name, e.target.value)}
            onBlur={f.name === titleField?.name ? onTitleBlur : undefined}
            placeholder={f.placeholder}
          />
        );
      case "number":
        return (
          <Input
            {...common}
            type="number"
            value={(v as number | string) ?? ""}
            onChange={(e) => set(f.name, e.target.value)}
          />
        );
      case "textarea":
        return (
          <Textarea
            {...common}
            rows={4}
            value={(v as string) ?? ""}
            onChange={(e) => set(f.name, e.target.value)}
          />
        );
      case "richtext":
        return (
          <RichTextEditor
            id={f.name}
            value={(v as string) ?? ""}
            onChange={(html) => set(f.name, html)}
            placeholder={f.placeholder}
          />
        );
      case "select":
        return (
          <Select
            {...common}
            value={(v as string) ?? ""}
            onChange={(e) => set(f.name, e.target.value)}
          >
            {(f.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        );
      case "image":
        return (
          <ImagePicker
            value={(v as string) ?? null}
            onChange={(url) => set(f.name, url)}
            recommendedSize={f.recommendedSize}
          />
        );
      case "imageWithAlt": {
        const altVal = (values[altKey(f.name)] as string) ?? "";
        return (
          <div className="space-y-2">
            <ImagePicker
              value={(v as string) ?? null}
              onChange={(url) => set(f.name, url)}
              recommendedSize={f.recommendedSize}
            />
            <Input
              value={altVal}
              onChange={(e) => set(altKey(f.name), e.target.value)}
              placeholder="Alt text — describe the image for accessibility & SEO"
            />
          </div>
        );
      }
      case "imageArray":
        return (
          <ImageArrayPicker
            value={(v as { url: string; alt?: string }[]) ?? []}
            onChange={(items) => set(f.name, items)}
            recommendedSize={f.recommendedSize}
          />
        );
      case "stringArray":
        return (
          <TagsInput
            value={(v as string[]) ?? []}
            onChange={(items) => set(f.name, items)}
          />
        );
      case "keywords":
        return (
          <KeywordsInput
            value={(v as string[]) ?? []}
            onChange={(items) => set(f.name, items)}
            placeholder={f.placeholder}
          />
        );
      case "boolean":
        return (
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(v)}
              onChange={(e) => set(f.name, e.target.checked)}
            />
            <span className="text-muted">{f.placeholder ?? "Enabled"}</span>
          </label>
        );
      case "json":
        return (
          <Textarea
            {...common}
            rows={10}
            className="font-mono text-xs"
            value={JSON.stringify(v ?? {}, null, 2)}
            onChange={(e) => {
              try {
                set(f.name, JSON.parse(e.target.value));
              } catch {
                /* keep stale until valid */
              }
            }}
          />
        );
    }
  };

  const renderSection = (title: string, fields: FieldDef[]) =>
    fields.length === 0 ? null : (
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">{title}</h3>
        {fields.map((f) => (
          <Field key={f.name} label={f.label ?? f.name} required={f.required} help={f.help}>
            {renderField(f)}
          </Field>
        ))}
      </Card>
    );

  return (
    <div className="space-y-5 max-w-4xl">
      {renderSection("Content", grouped.main)}
      {renderSection("SEO", grouped.seo)}
      {renderSection("Meta", grouped.meta)}

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
