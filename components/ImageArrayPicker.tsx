"use client";

import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "./ui";
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

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {value.map((it, i) => (
            <li key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.url}
                alt={it.alt ?? ""}
                className="aspect-square w-full rounded border border-rule object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 hidden group-hover:flex bg-white/90 rounded p-1 text-red-600"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
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
