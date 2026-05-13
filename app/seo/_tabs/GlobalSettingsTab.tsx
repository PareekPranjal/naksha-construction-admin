"use client";

import { Card, Field, Input, Textarea } from "@/components/ui";
import { ImagePicker } from "@/components/ImagePicker";
import { CharCount } from "@/components/CharCount";
import type { SeoSettings } from "../types";

type Props = {
  data: SeoSettings;
  set: <K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) => void;
};

export function GlobalSettingsTab({ data, set }: Props) {
  return (
    <div className="space-y-5">
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Site identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Site name">
            <Input value={data.siteName} onChange={(e) => set("siteName", e.target.value)} />
          </Field>
          <Field label="Site URL" help="Production URL — used in canonicals & OG.">
            <Input value={data.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Default metadata</h3>

        <Field label="Default title">
          <Input
            value={data.defaultTitle}
            onChange={(e) => set("defaultTitle", e.target.value)}
            placeholder="Naksha Construction — Building Construction Company in Jaipur"
          />
          <div className="mt-1 flex justify-end">
            <CharCount value={data.defaultTitle} type="title" />
          </div>
        </Field>

        <Field label="Title template" help="Use %s as the page title placeholder.">
          <Input
            value={data.titleTemplate}
            onChange={(e) => set("titleTemplate", e.target.value)}
            placeholder="%s | Naksha Construction"
          />
        </Field>

        <Field label="Default description">
          <Textarea
            rows={3}
            value={data.defaultDescription}
            onChange={(e) => set("defaultDescription", e.target.value)}
          />
          <div className="mt-1 flex justify-end">
            <CharCount value={data.defaultDescription} type="description" />
          </div>
        </Field>

        <Field label="Default keywords" help="Comma-separated. e.g. construction Jaipur, design-build contractor.">
          <Input
            value={data.defaultKeywords.join(", ")}
            onChange={(e) =>
              set(
                "defaultKeywords",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
          <p className="mt-1 text-xs text-muted">{data.defaultKeywords.length} keywords</p>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Default OG image" help="1200×630, used when a page has no specific share image.">
            <ImagePicker
              value={data.defaultOgImage}
              onChange={(url) => set("defaultOgImage", url ?? "")}
              recommendedSize="1200×630px (social share)"
            />
          </Field>
          <Field label="Favicon" help="64×64 PNG/ICO.">
            <ImagePicker
              value={data.favicon}
              onChange={(url) => set("favicon", url ?? "")}
              recommendedSize="64×64px square"
            />
          </Field>
          <Field label="Apple touch icon" help="180×180 PNG.">
            <ImagePicker
              value={data.appleTouchIcon}
              onChange={(url) => set("appleTouchIcon", url ?? "")}
              recommendedSize="180×180px square"
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
