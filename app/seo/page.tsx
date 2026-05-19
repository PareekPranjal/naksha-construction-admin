"use client";

import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  FileText,
  Database,
  Share2,
  Code2,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button, Card, PageHeader } from "@/components/ui";
import { Tabs, type Tab } from "@/components/Tabs";
import { GlobalSettingsTab } from "./_tabs/GlobalSettingsTab";
import { PageSeoTab } from "./_tabs/PageSeoTab";
import { ContentSeoTab } from "./_tabs/ContentSeoTab";
import { SocialTrackingTab } from "./_tabs/SocialTrackingTab";
import { AdvancedTab } from "./_tabs/AdvancedTab";
import type { SeoSettings, SeoStats } from "./types";

const EMPTY_SETTINGS: SeoSettings = {
  siteName: "",
  siteUrl: "",
  defaultTitle: "",
  titleTemplate: "%s | Naksha Construction",
  defaultDescription: "",
  defaultKeywords: [],
  defaultOgImage: "",
  favicon: "",
  appleTouchIcon: "",
  socialLinks: {},
  contactInfo: { address: {} },
  organizationSchema: { type: "GeneralContractor", name: "" },
  localBusiness: { address: {}, geo: {}, openingHours: [] },
  faqItems: [],
  googleSiteVerification: "",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  facebookPixelId: "",
  customHeadScripts: "",
  robotsTxt: "",
};

const TABS: Tab[] = [
  { id: "global", label: "Global Settings", icon: SettingsIcon },
  { id: "pages", label: "Page SEO", icon: FileText },
  { id: "content", label: "Content SEO", icon: Database },
  { id: "social", label: "Social & Tracking", icon: Share2 },
  { id: "advanced", label: "Advanced", icon: Code2 },
];

export default function SeoPage() {
  const [active, setActive] = useState("global");
  const [settings, setSettings] = useState<SeoSettings>(EMPTY_SETTINGS);
  const [stats, setStats] = useState<SeoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ settings: SeoSettings }>("/api/seo/global").catch((e) => {
        if (e instanceof ApiError) setError(e.message);
        return null;
      }),
      api.get<SeoStats>("/api/seo/stats").catch(() => null),
    ])
      .then(([global, st]) => {
        if (global?.settings) setSettings({ ...EMPTY_SETTINGS, ...global.settings });
        if (st) setStats(st);
      })
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) =>
    setSettings((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const r = await api.patch<{ settings: SeoSettings }>("/api/seo/global", settings);
      if (r.settings) setSettings({ ...EMPTY_SETTINGS, ...r.settings });
      setSavedAt(new Date());
      // refresh stats too — tracking-set booleans may have changed
      const st = await api.get<SeoStats>("/api/seo/stats").catch(() => null);
      if (st) setStats(st);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else if (e instanceof Error) setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  // Global save button only matters for tabs that mutate settings.
  const globalSaveTab = active === "global" || active === "social" || active === "advanced";

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="SEO"
        description="Site-wide SEO defaults, per-page overrides, content coverage and structured data."
        action={
          globalSaveTab ? (
            <div className="flex items-center gap-2">
              {savedAt && (
                <span className="text-xs text-muted">Saved {savedAt.toLocaleTimeString()}</span>
              )}
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          ) : null
        }
      />

      {stats && <StatsBar stats={stats} />}

      <CascadeBanner />

      <Tabs tabs={TABS} active={active} onChange={setActive} />

      {active === "global" && <GlobalSettingsTab data={settings} set={set} />}
      {active === "pages" && <PageSeoTab />}
      {active === "content" && <ContentSeoTab />}
      {active === "social" && <SocialTrackingTab data={settings} set={set} />}
      {active === "advanced" && <AdvancedTab data={settings} set={set} />}

      {globalSaveTab && error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {globalSaveTab && (
        <div className="mt-6 flex items-center gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          {savedAt && (
            <span className="text-xs text-muted">Saved {savedAt.toLocaleTimeString()}</span>
          )}
        </div>
      )}
    </div>
  );
}

function CascadeBanner() {
  return (
    <Card className="p-4 mb-5 border-l-4 border-l-accent">
      <div className="flex items-start gap-3">
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-ink mb-1">How SEO values are chosen</p>
          <p className="text-muted">
            For any page the website picks the first set value in this order:
          </p>
          <ol className="mt-2 space-y-0.5 text-ink">
            <li>
              <span className="inline-block w-4 text-muted">1.</span>{" "}
              <span className="font-medium">Per-item SEO</span>{" "}
              <span className="text-muted">
                — the SEO section on a Project / Service / Article / etc. edit form. Wins for that
                specific URL.
              </span>
            </li>
            <li>
              <span className="inline-block w-4 text-muted">2.</span>{" "}
              <span className="font-medium">Page SEO override</span>{" "}
              <span className="text-muted">
                — a row in the <em>Page SEO</em> tab keyed by URL path. Use it for static pages or
                to force a value on a path that has no collection item.
              </span>
            </li>
            <li>
              <span className="inline-block w-4 text-muted">3.</span>{" "}
              <span className="font-medium">Auto fallback</span>{" "}
              <span className="text-muted">
                — derived from the item itself (title → SEO title, summary → description, cover →
                OG image) when nothing explicit is set.
              </span>
            </li>
            <li>
              <span className="inline-block w-4 text-muted">4.</span>{" "}
              <span className="font-medium">Global defaults</span>{" "}
              <span className="text-muted">
                — the <em>Global Settings</em> tab. Catch-all for everything else.
              </span>
            </li>
          </ol>
          <p className="mt-2 text-muted">
            Open any item or page below and watch the <strong className="text-ink">Live SEO preview</strong>{" "}
            update in real time — every value carries a badge telling you which layer it came from.
          </p>
        </div>
      </div>
    </Card>
  );
}

function StatsBar({ stats }: { stats: SeoStats }) {
  const items = [
    { label: "Page overrides", value: stats.seoPages },
    { label: "Projects", value: `${stats.projects.optimized}/${stats.projects.total}` },
    { label: "Services", value: `${stats.services.optimized}/${stats.services.total}` },
    { label: "Articles", value: `${stats.articles.optimized}/${stats.articles.total}` },
  ];
  const tracking = [
    { label: "GSC verification", set: stats.tracking.googleSiteVerification },
    { label: "Google Analytics", set: stats.tracking.googleAnalyticsId },
    { label: "Google Tag Manager", set: stats.tracking.googleTagManagerId },
    { label: "Facebook Pixel", set: stats.tracking.facebookPixelId },
  ];
  return (
    <Card className="p-4 mb-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {items.map((it) => (
          <div key={it.label}>
            <p className="text-xs text-muted">{it.label}</p>
            <p className="text-lg font-semibold tabular-nums">{it.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-rule flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {tracking.map((t) => (
          <span key={t.label} className={t.set ? "text-emerald-700" : "text-muted"}>
            {t.set ? "✓" : "·"} {t.label}
          </span>
        ))}
      </div>
    </Card>
  );
}
