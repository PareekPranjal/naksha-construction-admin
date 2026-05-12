"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import type { MediaAsset } from "@/lib/types";
import { Button, Card, PageHeader } from "@/components/ui";
import { useConfirm } from "@/components/Confirm";

export default function MediaLibraryPage() {
  const confirm = useConfirm();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const reload = () => {
    setError(null);
    api
      .get<MediaAsset[]>("/media")
      .then(setAssets)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const onUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const f of Array.from(files)) await uploadToCloudinary(f);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: string) => {
    const asset = assets.find((a) => a.id === id);
    const ok = await confirm({
      title: "Delete this asset?",
      message:
        "This permanently removes the file from Cloudinary and the media library. Pages or collection items still referencing it will show a broken image.",
      confirmLabel: "Delete asset",
      typeToConfirm: asset?.publicId,
    });
    if (!ok) return;
    await api.delete(`/media/${id}`);
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Media library"
        description="All images stored in Cloudinary. Drop files anywhere or click Upload."
        action={
          <>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
            />
            <Button onClick={() => fileInput.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
            </Button>
          </>
        }
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : assets.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">No images yet.</Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {assets.map((a) => (
            <div key={a.id} className="rounded-md border border-rule bg-white overflow-hidden group">
              <div className="aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.secureUrl} alt={a.alt} className="h-full w-full object-cover" />
              </div>
              <div className="p-2 text-xs">
                <p className="truncate font-mono text-[10px] text-muted">{a.publicId}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted">
                    {a.width}×{a.height}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete(a.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
