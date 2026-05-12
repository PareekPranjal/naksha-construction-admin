import { api, apiUrl } from "./api";
import type { MediaAsset } from "./types";

type SignResp = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  tags: string[];
};

type CldUploadResult = {
  public_id: string;
  url: string;
  secure_url: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
};

/**
 * Upload a single file to Cloudinary using a backend-issued signature,
 * then register the asset in our DB. Returns the registered MediaAsset.
 */
export async function uploadToCloudinary(file: File, opts?: { folder?: string; tags?: string[] }): Promise<MediaAsset> {
  const sign = await api.post<SignResp>("/uploads/sign", {
    folder: opts?.folder ?? "naksha",
    tags: opts?.tags ?? [],
  });

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sign.apiKey);
  fd.append("timestamp", String(sign.timestamp));
  fd.append("signature", sign.signature);
  fd.append("folder", sign.folder);
  if (sign.tags.length) fd.append("tags", sign.tags.join(","));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${res.status} ${body}`);
  }
  const cld = (await res.json()) as CldUploadResult;

  const asset = await api.post<MediaAsset>("/media", {
    publicId: cld.public_id,
    url: cld.url,
    secureUrl: cld.secure_url,
    format: cld.format ?? null,
    width: cld.width ?? null,
    height: cld.height ?? null,
    bytes: cld.bytes ?? null,
    alt: "",
    tags: opts?.tags ?? [],
    folder: sign.folder,
  });

  return asset;
}

export { apiUrl };
