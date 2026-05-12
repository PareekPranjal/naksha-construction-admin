"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Plus,
  Trash2,
  Twitter,
  Youtube,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { ImagePicker } from "@/components/ImagePicker";

type Social = { icon: string; label?: string; url: string };
type Settings = {
  // identity
  name: string;
  shortName: string;
  wordmark: string;
  tagline: string;
  url: string;
  email: string;
  phone: string;
  address: { line1: string; line2: string; country: string };
  // brand
  logoLight: string; // shown on dark backgrounds
  logoDark: string; // shown on light backgrounds
  favicon: string;
  // SEO defaults
  seo: {
    titleTemplate: string; // e.g. "%s — Naksha"
    description: string;
    keywords: string;
    robots: string;
    ogImage: string;
    twitterHandle: string;
    googleVerification: string;
  };
  // social
  socials: Social[];
};

const EMPTY: Settings = {
  name: "Naksha Construction",
  shortName: "Naksha",
  wordmark: "NAKSHA",
  tagline: "Building Rajasthan, brick by considered brick.",
  url: "https://nakshaconstruction.example",
  email: "hello@nakshaconstruction.example",
  phone: "+91 98765 43210",
  address: { line1: "Plot 12, Civil Lines", line2: "Jaipur, Rajasthan 302006", country: "India" },
  logoLight: "",
  logoDark: "",
  favicon: "",
  seo: {
    titleTemplate: "%s — Naksha Construction",
    description: "",
    keywords: "",
    robots: "index,follow",
    ogImage: "",
    twitterHandle: "",
    googleVerification: "",
  },
  socials: [],
};

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  x: Twitter,
  github: Github,
  email: Mail,
  phone: Phone,
  website: Globe,
};

const ICON_OPTIONS = Object.keys(SOCIAL_ICONS);

export default function SettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    api
      .get<{ value: Partial<Settings> }>("/globals/siteSettings")
      .then((g) => setData(merge(EMPTY, g.value)))
      .catch((e: ApiError) => {
        if (e.status !== 404) setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      await api.put("/globals/siteSettings", { value: data });
      setSavedAt(new Date());
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setData((d) => ({ ...d, [k]: v }));
  const setSeo = <K extends keyof Settings["seo"]>(k: K, v: Settings["seo"][K]) =>
    setData((d) => ({ ...d, seo: { ...d.seo, [k]: v } }));
  const setAddr = (k: keyof Settings["address"], v: string) =>
    setData((d) => ({ ...d, address: { ...d.address, [k]: v } }));

  const addSocial = () =>
    setData((d) => ({ ...d, socials: [...d.socials, { icon: "linkedin", url: "" }] }));
  const updateSocial = (i: number, patch: Partial<Social>) =>
    setData((d) => ({
      ...d,
      socials: d.socials.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  const removeSocial = (i: number) =>
    setData((d) => ({ ...d, socials: d.socials.filter((_, idx) => idx !== i) }));

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Site settings"
        description="Identity, branding, default SEO, and social media. Saves to the siteSettings global."
        action={
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        }
      />

      <Card className="p-5 mb-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Site name">
            <Input value={data.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Short name">
            <Input value={data.shortName} onChange={(e) => set("shortName", e.target.value)} />
          </Field>
          <Field label="Wordmark text">
            <Input value={data.wordmark} onChange={(e) => set("wordmark", e.target.value)} />
          </Field>
          <Field label="Tagline">
            <Input value={data.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Site URL">
            <Input value={data.url} onChange={(e) => set("url", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={data.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={data.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Address line 1">
            <Input value={data.address.line1} onChange={(e) => setAddr("line1", e.target.value)} />
          </Field>
          <Field label="Address line 2">
            <Input value={data.address.line2} onChange={(e) => setAddr("line2", e.target.value)} />
          </Field>
          <Field label="Country">
            <Input
              value={data.address.country}
              onChange={(e) => setAddr("country", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5 mb-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Logo (for light backgrounds)" help="Used in the header by default.">
            <ImagePicker
              value={data.logoDark}
              onChange={(url) => set("logoDark", url ?? "")}
              recommendedSize="400×120px, transparent PNG/SVG"
            />
          </Field>
          <Field label="Logo (for dark backgrounds)" help="Used in the footer / over hero.">
            <ImagePicker
              value={data.logoLight}
              onChange={(url) => set("logoLight", url ?? "")}
              recommendedSize="400×120px, transparent PNG/SVG"
            />
          </Field>
          <Field label="Favicon" help="Browser tab icon.">
            <ImagePicker
              value={data.favicon}
              onChange={(url) => set("favicon", url ?? "")}
              recommendedSize="64×64px (1:1 square), PNG/ICO"
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5 mb-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">SEO defaults</h3>
        <p className="text-xs text-muted">
          Used when a page does not override a value. The title template lets you append your
          site name to every page (use <code>%s</code> as a placeholder for the page title).
        </p>
        <Field label="Title template" help='e.g. "%s — Naksha Construction"'>
          <Input
            value={data.seo.titleTemplate}
            onChange={(e) => setSeo("titleTemplate", e.target.value)}
          />
        </Field>
        <Field label="Default description">
          <Textarea
            value={data.seo.description}
            onChange={(e) => setSeo("description", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Default keywords" help="Comma-separated.">
            <Input value={data.seo.keywords} onChange={(e) => setSeo("keywords", e.target.value)} />
          </Field>
          <Field label="Default robots">
            <Input value={data.seo.robots} onChange={(e) => setSeo("robots", e.target.value)} />
          </Field>
        </div>
        <Field label="Default OG image" help="Used when a page has no specific share image.">
          <ImagePicker
            value={data.seo.ogImage}
            onChange={(url) => setSeo("ogImage", url ?? "")}
            recommendedSize="1200×630px (social share)"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Twitter handle" help="e.g. @naksha">
            <Input
              value={data.seo.twitterHandle}
              onChange={(e) => setSeo("twitterHandle", e.target.value)}
            />
          </Field>
          <Field label="Google site verification" help="Verification code only, no <meta>.">
            <Input
              value={data.seo.googleVerification}
              onChange={(e) => setSeo("googleVerification", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5 mb-5">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Social media
          </h3>
          <Button variant="secondary" type="button" onClick={addSocial}>
            <Plus className="h-4 w-4" /> Add social
          </Button>
        </div>
        {data.socials.length === 0 ? (
          <p className="text-sm text-muted py-3">
            No social links yet. Click <strong>Add social</strong> to add LinkedIn, Instagram, etc.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.socials.map((s, i) => {
              const Icon = SOCIAL_ICONS[s.icon] ?? Globe;
              return (
                <li key={i} className="grid grid-cols-[auto_1fr_2fr_auto] gap-2 items-center">
                  <div className="rounded-md border border-rule bg-white p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Select
                    value={s.icon}
                    onChange={(e) => updateSocial(i, { icon: e.target.value })}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                  <Input
                    value={s.url}
                    onChange={(e) => updateSocial(i, { url: e.target.value })}
                    placeholder="https://"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocial(i)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
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

function merge<T extends Record<string, unknown>>(base: T, patch: Partial<T> = {}): T {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch ?? {})) {
    if (v === undefined || v === null) continue;
    const baseVal = (base as Record<string, unknown>)[k];
    if (
      typeof v === "object" &&
      !Array.isArray(v) &&
      typeof baseVal === "object" &&
      baseVal !== null &&
      !Array.isArray(baseVal)
    ) {
      out[k] = merge(baseVal as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}
