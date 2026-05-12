"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { GlobalDoc } from "@/lib/types";
import { Button, Card, Field, PageHeader, Textarea } from "@/components/ui";
import { useConfirm } from "@/components/Confirm";

export default function GlobalEditorPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const { key } = useParams<{ key: string }>();
  const [text, setText] = useState<string>("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<GlobalDoc>(`/globals/${encodeURIComponent(key)}`)
      .then((g) => setText(JSON.stringify(g.value, null, 2)))
      .catch((e: ApiError) => {
        if (e.status === 404) setText("{}");
        else setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [key]);

  const save = async () => {
    setError(null);
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/globals/${encodeURIComponent(key)}`, { value });
      router.push("/site");
      router.refresh();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Delete global "${key}"?`,
      message:
        "This permanently removes the site-wide value. Any page or component reading this global will fall back to defaults.",
      confirmLabel: "Delete global",
      typeToConfirm: key,
    });
    if (!ok) return;
    await api.delete(`/globals/${encodeURIComponent(key)}`);
    router.push("/site");
    router.refresh();
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title={`Site / ${key}`} description={`Edit the JSON value stored under key "${key}".`} />
      <Card className="p-5 space-y-3">
        <Field label="Value (JSON)">
          <Textarea
            rows={20}
            className="font-mono text-xs"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-2 pt-2">
          <Button onClick={save} disabled={saving || loading}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="danger" type="button" onClick={remove} className="ml-auto">
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}
