"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { api } from "@/lib/api";
import {
  buildInternalUrl,
  INTERNAL_DOC_TYPE_LABELS,
  type InternalDocRef,
  type InternalDocType,
} from "@/lib/internalUrl";

type IndexResponse = Record<InternalDocType, InternalDocRef[]>;

const ORDER: InternalDocType[] = ["page", "project", "service", "market", "article", "job", "location"];

let cache: { at: number; data: IndexResponse } | null = null;
const TTL_MS = 60_000;

async function loadIndex(): Promise<IndexResponse> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const data = await api.get<IndexResponse>("/internal-links");
  cache = { at: Date.now(), data };
  return data;
}

type Props = {
  onSelect: (doc: InternalDocRef) => void;
  onClose: () => void;
};

export function InternalLinkPicker({ onSelect, onClose }: Props) {
  const [data, setData] = useState<IndexResponse | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIndex().then(setData).catch((e) => setError(e?.message ?? "Failed to load"));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return null;
    const q = query.trim().toLowerCase();
    const out: IndexResponse = { page: [], project: [], service: [], market: [], article: [], job: [], location: [] };
    for (const t of ORDER) {
      const list = data[t] ?? [];
      out[t] = q ? list.filter((d) => d.title.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q)) : list;
    }
    return out;
  }, [data, query]);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="mt-12 w-full max-w-2xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-rule px-4 py-3">
          <h3 className="text-sm font-semibold">Insert internal link</h3>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-b border-rule px-4 py-3">
          <div className="flex items-center gap-2 rounded-md border border-rule px-2 py-1.5">
            <Search className="h-4 w-4 text-muted" />
            <input
              autoFocus
              type="text"
              placeholder="Search by title or slug…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-4 py-3 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!data && !error && <p className="text-sm text-muted">Loading…</p>}
          {filtered &&
            ORDER.map((t) => {
              const list = filtered[t];
              if (!list || list.length === 0) return null;
              return (
                <section key={t}>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    {INTERNAL_DOC_TYPE_LABELS[t]}
                  </h4>
                  <ul className="space-y-1">
                    {list.map((doc) => (
                      <li key={`${t}-${doc.id}`}>
                        <button
                          type="button"
                          onClick={() => {
                            const url = doc.url || buildInternalUrl(t, doc.slug);
                            onSelect({ ...doc, url });
                          }}
                          className="w-full rounded-md border border-rule px-3 py-2 text-left hover:border-ink hover:bg-rule/10"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="truncate text-sm font-medium">{doc.title || doc.slug}</span>
                            <span className="shrink-0 text-xs text-muted">{doc.url || buildInternalUrl(t, doc.slug)}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          {filtered && ORDER.every((t) => (filtered[t]?.length ?? 0) === 0) && (
            <p className="text-sm text-muted">No matches.</p>
          )}
        </div>
      </div>
    </div>
  );
}
