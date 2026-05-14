"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { ImagePicker } from "@/components/ImagePicker";
import { KeywordsInput } from "@/components/KeywordsInput";
import type { SeoSettings } from "../types";

type Props = {
  data: SeoSettings;
  set: <K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) => void;
};

const SCHEMA_TYPES = [
  "Organization",
  "Corporation",
  "LocalBusiness",
  "GeneralContractor",
  "ProfessionalService",
];

export function AdvancedTab({ data, set }: Props) {
  const setOrg = <K extends keyof SeoSettings["organizationSchema"]>(k: K, v: SeoSettings["organizationSchema"][K]) =>
    set("organizationSchema", { ...data.organizationSchema, [k]: v });

  const setLb = <K extends keyof SeoSettings["localBusiness"]>(k: K, v: SeoSettings["localBusiness"][K]) =>
    set("localBusiness", { ...data.localBusiness, [k]: v });
  const setLbAddr = (k: keyof NonNullable<SeoSettings["localBusiness"]["address"]>, v: string) =>
    setLb("address", { ...(data.localBusiness.address ?? {}), [k]: v });
  const setLbGeo = (k: "latitude" | "longitude", v: string) => {
    const num = v === "" ? undefined : Number(v);
    setLb("geo", { ...(data.localBusiness.geo ?? {}), [k]: Number.isNaN(num) ? undefined : num });
  };

  const addFaq = () => set("faqItems", [...(data.faqItems ?? []), { question: "", answer: "" }]);
  const updateFaq = (i: number, patch: Partial<{ question: string; answer: string }>) =>
    set(
      "faqItems",
      (data.faqItems ?? []).map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    );
  const removeFaq = (i: number) => set("faqItems", (data.faqItems ?? []).filter((_, idx) => idx !== i));

  const sitemapUrl = `${(data.siteUrl || "").replace(/\/$/, "")}/sitemap.xml`;
  const robotsUrl = `${(data.siteUrl || "").replace(/\/$/, "")}/robots.txt`;

  return (
    <div className="space-y-5">
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
          Organization schema (JSON-LD)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Schema type">
            <select
              className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm outline-none focus:border-ink"
              value={data.organizationSchema.type}
              onChange={(e) => setOrg("type", e.target.value)}
            >
              {SCHEMA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Organization name">
            <Input value={data.organizationSchema.name} onChange={(e) => setOrg("name", e.target.value)} />
          </Field>
        </div>
        <Field label="Organization description">
          <Textarea
            rows={2}
            value={data.organizationSchema.description ?? ""}
            onChange={(e) => setOrg("description", e.target.value)}
          />
        </Field>
        <Field label="Logo (used in JSON-LD)">
          <ImagePicker
            value={data.organizationSchema.logo ?? ""}
            onChange={(url) => setOrg("logo", url ?? "")}
            recommendedSize="≥600×60px PNG/SVG"
          />
        </Field>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
          LocalBusiness schema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Telephone">
            <Input value={data.localBusiness.telephone ?? ""} onChange={(e) => setLb("telephone", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={data.localBusiness.email ?? ""} onChange={(e) => setLb("email", e.target.value)} />
          </Field>
          <Field label="Price range" help='e.g. "$$$"'>
            <Input value={data.localBusiness.priceRange ?? ""} onChange={(e) => setLb("priceRange", e.target.value)} />
          </Field>
        </div>

        <Field label="Opening hours" help='Schema.org format, comma-separated. e.g. "Mo-Sa 09:00-18:00, Su 10:00-14:00"'>
          <KeywordsInput
            value={data.localBusiness.openingHours ?? []}
            onChange={(next) => setLb("openingHours", next)}
            placeholder="Mo-Sa 09:00-18:00, Su 10:00-14:00"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Latitude">
            <Input
              type="number"
              step="any"
              value={data.localBusiness.geo?.latitude ?? ""}
              onChange={(e) => setLbGeo("latitude", e.target.value)}
              placeholder="26.9124"
            />
          </Field>
          <Field label="Longitude">
            <Input
              type="number"
              step="any"
              value={data.localBusiness.geo?.longitude ?? ""}
              onChange={(e) => setLbGeo("longitude", e.target.value)}
              placeholder="75.7873"
            />
          </Field>
        </div>

        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider pt-2">Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Street">
            <Input
              value={data.localBusiness.address?.street ?? ""}
              onChange={(e) => setLbAddr("street", e.target.value)}
            />
          </Field>
          <Field label="City">
            <Input
              value={data.localBusiness.address?.city ?? ""}
              onChange={(e) => setLbAddr("city", e.target.value)}
            />
          </Field>
          <Field label="State">
            <Input
              value={data.localBusiness.address?.state ?? ""}
              onChange={(e) => setLbAddr("state", e.target.value)}
            />
          </Field>
          <Field label="Postal code">
            <Input
              value={data.localBusiness.address?.postalCode ?? ""}
              onChange={(e) => setLbAddr("postalCode", e.target.value)}
            />
          </Field>
          <Field label="Country">
            <Input
              value={data.localBusiness.address?.country ?? ""}
              onChange={(e) => setLbAddr("country", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
            FAQ schema
          </h3>
          <Button variant="secondary" type="button" onClick={addFaq}>
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        </div>
        <p className="text-xs text-muted mb-3">
          When at least one item is set, FAQPage JSON-LD is injected into the homepage head.
        </p>
        {(data.faqItems ?? []).length === 0 ? (
          <p className="text-sm text-muted py-3">No FAQ items yet.</p>
        ) : (
          <ul className="space-y-3">
            {(data.faqItems ?? []).map((f, i) => (
              <li key={i} className="rounded-md border border-rule p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">#{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  placeholder="Question"
                  value={f.question}
                  onChange={(e) => updateFaq(i, { question: e.target.value })}
                />
                <Textarea
                  rows={2}
                  placeholder="Answer"
                  value={f.answer}
                  onChange={(e) => updateFaq(i, { answer: e.target.value })}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
          Custom head scripts
        </h3>
        <p className="text-xs text-muted">
          Pasted as raw JS inside a <code>&lt;script&gt;</code> tag in <code>&lt;head&gt;</code>. Use for
          tools that don&apos;t have a dedicated field above (e.g. Hotjar, Clarity, Crisp).
        </p>
        <Textarea
          rows={6}
          value={data.customHeadScripts}
          onChange={(e) => set("customHeadScripts", e.target.value)}
          className="font-mono text-xs"
        />
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">robots.txt</h3>
        <p className="text-xs text-muted">
          Optional override. The frontend ships a sensible default at{" "}
          <a href={robotsUrl} target="_blank" rel="noreferrer" className="underline">
            {robotsUrl || "/robots.txt"}
          </a>
          . Leave this empty to keep the default.
        </p>
        <Textarea
          rows={6}
          value={data.robotsTxt}
          onChange={(e) => set("robotsTxt", e.target.value)}
          className="font-mono text-xs"
          placeholder={`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${sitemapUrl}`}
        />
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
          Sitemap URL
        </h3>
        <p className="text-sm">
          <a href={sitemapUrl} target="_blank" rel="noreferrer" className="font-mono text-xs underline">
            {sitemapUrl}
          </a>
        </p>
        <p className="mt-2 text-xs text-muted">
          Generated dynamically from your collections every hour. Submit this to Google Search Console.
        </p>
      </Card>
    </div>
  );
}
