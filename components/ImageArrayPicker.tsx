"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { Button, Input } from "./ui";
import { MediaPickerDialog } from "./ImagePicker";
import type { MediaAsset } from "@/lib/types";

type Item = { url: string; alt?: string };

export function ImageArrayPicker({
  value,
  onChange,
  recommendedSize,
}: {
  value: Item[];
  onChange: (next: Item[]) => void;
  recommendedSize?: string;
}) {
  const [open, setOpen] = useState(false);

  const updateAlt = (i: number, alt: string) =>
    onChange(value.map((it, j) => (j === i ? { ...it, alt } : it)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-3 space-y-2">
          {value.map((it, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-md border border-rule p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.url}
                alt={it.alt ?? ""}
                className="h-16 w-16 shrink-0 rounded border border-rule object-cover"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <Input
                  value={it.alt ?? ""}
                  onChange={(e) => updateAlt(i, e.target.value)}
                  placeholder="Alt text — describe the image for accessibility & SEO"
                />
                <p className="truncate font-mono text-[11px] text-muted" title={it.url}>
                  {it.url}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded p-1 text-muted hover:bg-rule/30 disabled:opacity-30"
                  title="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  className="rounded p-1 text-muted hover:bg-rule/30 disabled:opacity-30"
                  title="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded p-1 text-red-600 hover:bg-red-50"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <ImagePlus className="h-4 w-4" /> Add images
      </Button>
      {recommendedSize && (
        <p className="mt-2 text-xs text-muted">
          Recommended size: <span className="font-medium text-ink">{recommendedSize}</span>
        </p>
      )}
      {open && (
        <MediaPickerDialog
          multiple
          onClose={() => setOpen(false)}
          onPick={() => undefined}
          onPickMany={(assets: MediaAsset[]) => {
            onChange([...value, ...assets.map((a) => ({ url: a.secureUrl, alt: a.alt }))]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
