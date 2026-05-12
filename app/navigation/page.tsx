"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button, Card, Field, Input, PageHeader } from "@/components/ui";

type NavLink = { label: string; href: string };
type NavItem = { label: string; href: string; children?: NavLink[] };
type Navbar = { cta: NavLink; items: NavItem[] };

const EMPTY: Navbar = { cta: { label: "Start a project", href: "/contact" }, items: [] };

export default function NavigationEditorPage() {
  const router = useRouter();
  const [data, setData] = useState<Navbar>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    api
      .get<{ value: Navbar }>("/globals/navbar")
      .then((g) => setData(normalize(g.value)))
      .catch((e: ApiError) => {
        if (e.status !== 404) setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      await api.put("/globals/navbar", { value: data });
      setSavedAt(new Date());
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (i: number, patch: Partial<NavItem>) =>
    setData((d) => ({
      ...d,
      items: d.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    }));

  const addItem = () =>
    setData((d) => ({
      ...d,
      items: [...d.items, { label: "New section", href: "/", children: [] }],
    }));

  const removeItem = (i: number) =>
    setData((d) => ({ ...d, items: d.items.filter((_, idx) => idx !== i) }));

  const moveItem = (i: number, dir: -1 | 1) =>
    setData((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.items.length) return d;
      const items = [...d.items];
      [items[i], items[j]] = [items[j], items[i]];
      return { ...d, items };
    });

  const addChild = (i: number) =>
    setData((d) => ({
      ...d,
      items: d.items.map((it, idx) =>
        idx === i ? { ...it, children: [...(it.children ?? []), { label: "New link", href: "/" }] } : it,
      ),
    }));

  const updateChild = (i: number, ci: number, patch: Partial<NavLink>) =>
    setData((d) => ({
      ...d,
      items: d.items.map((it, idx) =>
        idx === i
          ? {
              ...it,
              children: (it.children ?? []).map((c, cIdx) => (cIdx === ci ? { ...c, ...patch } : c)),
            }
          : it,
      ),
    }));

  const removeChild = (i: number, ci: number) =>
    setData((d) => ({
      ...d,
      items: d.items.map((it, idx) =>
        idx === i ? { ...it, children: (it.children ?? []).filter((_, cIdx) => cIdx !== ci) } : it,
      ),
    }));

  const moveChild = (i: number, ci: number, dir: -1 | 1) =>
    setData((d) => ({
      ...d,
      items: d.items.map((it, idx) => {
        if (idx !== i) return it;
        const children = [...(it.children ?? [])];
        const j = ci + dir;
        if (j < 0 || j >= children.length) return it;
        [children[ci], children[j]] = [children[j], children[ci]];
        return { ...it, children };
      }),
    }));

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Navigation"
        description="Top nav links, sub-menus, and the header CTA. Saves to the navbar global — the website re-renders within ~60s."
        action={
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        }
      />

      <Card className="p-5 mb-5">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Header CTA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Label">
            <Input
              value={data.cta.label}
              onChange={(e) => setData((d) => ({ ...d, cta: { ...d.cta, label: e.target.value } }))}
            />
          </Field>
          <Field label="URL">
            <Input
              value={data.cta.href}
              onChange={(e) => setData((d) => ({ ...d, cta: { ...d.cta, href: e.target.value } }))}
            />
          </Field>
        </div>
      </Card>

      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Nav items</h3>
        <Button variant="secondary" onClick={addItem}>
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </div>

      <div className="space-y-3">
        {data.items.map((it, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-2">
                <button
                  type="button"
                  onClick={() => moveItem(i, -1)}
                  disabled={i === 0}
                  className="text-muted hover:text-ink disabled:opacity-30"
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(i, 1)}
                  disabled={i === data.items.length - 1}
                  className="text-muted hover:text-ink disabled:opacity-30"
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Label">
                    <Input value={it.label} onChange={(e) => updateItem(i, { label: e.target.value })} />
                  </Field>
                  <Field label="URL">
                    <Input value={it.href} onChange={(e) => updateItem(i, { href: e.target.value })} />
                  </Field>
                </div>

                <div className="rounded-md border border-rule p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">Sub-links</p>
                    <Button variant="ghost" type="button" onClick={() => addChild(i)}>
                      <Plus className="h-3.5 w-3.5" /> Add sub-link
                    </Button>
                  </div>
                  {(it.children ?? []).length === 0 ? (
                    <p className="text-xs text-muted py-2">
                      No sub-links — this nav item is a single direct link.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {(it.children ?? []).map((c, ci) => (
                        <li key={ci} className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => moveChild(i, ci, -1)}
                              disabled={ci === 0}
                              className="text-muted hover:text-ink disabled:opacity-30"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveChild(i, ci, 1)}
                              disabled={ci === (it.children ?? []).length - 1}
                              className="text-muted hover:text-ink disabled:opacity-30"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                          <Input
                            placeholder="Label"
                            value={c.label}
                            onChange={(e) => updateChild(i, ci, { label: e.target.value })}
                            className="flex-1"
                          />
                          <Input
                            placeholder="/url"
                            value={c.href}
                            onChange={(e) => updateChild(i, ci, { href: e.target.value })}
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeChild(i, ci)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Remove sub-link"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove "${it.label}"?`)) removeItem(i);
                }}
                className="text-red-600 hover:text-red-700 p-2"
                title="Remove nav item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
        {data.items.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted">
            No nav items yet. Click &quot;Add item&quot; to start.
          </Card>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="secondary" type="button" onClick={() => router.push("/")}>
          Cancel
        </Button>
        {savedAt && (
          <span className="text-xs text-muted">Saved {savedAt.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}

function normalize(v: unknown): Navbar {
  const obj = (v ?? {}) as Partial<Navbar>;
  return {
    cta: obj.cta ?? EMPTY.cta,
    items: Array.isArray(obj.items) ? obj.items : [],
  };
}
