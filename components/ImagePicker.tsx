"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import type { MediaAsset } from "@/lib/types";
import { Button } from "./ui";
import { cn } from "@/lib/cn";

type Props = {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  /** Display a recommended size hint, e.g. "1600×1000px" or "1:1 square". */
  recommendedSize?: string;
};

export function ImagePicker({ value, onChange, recommendedSize }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-32 w-32 rounded-md border border-rule object-cover" />
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
              Replace
            </Button>
            <Button type="button" variant="ghost" onClick={() => onChange(null)}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          <ImagePlus className="h-4 w-4" /> Choose image
        </Button>
      )}
      {recommendedSize && (
        <p className="mt-2 text-xs text-muted">
          Recommended size: <span className="font-medium text-ink">{recommendedSize}</span>
        </p>
      )}
      {open && (
        <MediaPickerDialog
          onClose={() => setOpen(false)}
          onPick={(asset) => {
            onChange(asset.secureUrl);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

type DialogProps = {
  onClose: () => void;
  onPick: (asset: MediaAsset) => void;
  multiple?: boolean;
  onPickMany?: (assets: MediaAsset[]) => void;
};

export function MediaPickerDialog({ onClose, onPick, multiple, onPickMany }: DialogProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileInput = useRef<HTMLInputElement>(null);

  const reload = () => {
    setError(null);
    api
      .get<MediaAsset[]>("/media")
      .then(setAssets)
      .catch((e: Error) => setError(e.message));
  };

  useEffect(reload, []);

  const onUploadFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const f of Array.from(files)) {
        await uploadToCloudinary(f);
      }
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-paper rounded-lg w-full max-w-5xl max-h-[85vh] flex flex-col border border-rule">
        <div className="flex items-center justify-between px-5 py-3 border-b border-rule">
          <h2 className="text-base font-semibold">Media library</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-rule flex items-center gap-3">
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => onUploadFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="primary"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
          </Button>
          {error && <span className="text-xs text-red-600">{error}</span>}
          {multiple && onPickMany && (
            <div className="ml-auto">
              <Button
                type="button"
                onClick={() => {
                  const picks = assets.filter((a) => selected.has(a.id));
                  if (picks.length) onPickMany(picks);
                  onClose();
                }}
                disabled={selected.size === 0}
              >
                Pick {selected.size || ""}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-5">
          {assets.length === 0 ? (
            <p className="text-sm text-muted">
              No media yet. Upload your first image with the button above.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {assets.map((a) => {
                const isSelected = selected.has(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      if (multiple) {
                        const next = new Set(selected);
                        if (isSelected) next.delete(a.id);
                        else next.add(a.id);
                        setSelected(next);
                      } else {
                        onPick(a);
                      }
                    }}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-md border bg-white",
                      isSelected ? "border-ink ring-2 ring-ink" : "border-rule hover:border-ink",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.secureUrl} alt={a.alt} className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
