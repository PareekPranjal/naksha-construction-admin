"use client";

import { Facebook, Instagram, Linkedin, MessageCircle, Twitter, Youtube } from "lucide-react";
import { Card, Field, Input } from "@/components/ui";
import type { SeoSettings } from "../types";

type Props = {
  data: SeoSettings;
  set: <K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) => void;
};

const SOCIAL_FIELDS: { key: keyof SeoSettings["socialLinks"]; label: string; icon: React.ComponentType<{ className?: string }>; placeholder: string }[] = [
  { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/nakshaconstruction" },
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/nakshaconstruction" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/company/naksha-construction" },
  { key: "twitter", label: "Twitter / X", icon: Twitter, placeholder: "https://twitter.com/naksha_in" },
  { key: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@nakshaconstruction" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, placeholder: "https://wa.me/91…" },
];

export function SocialTrackingTab({ data, set }: Props) {
  const setSocial = (k: keyof SeoSettings["socialLinks"], v: string) =>
    set("socialLinks", { ...data.socialLinks, [k]: v });
  const setContact = <K extends keyof SeoSettings["contactInfo"]>(k: K, v: SeoSettings["contactInfo"][K]) =>
    set("contactInfo", { ...data.contactInfo, [k]: v });
  const setAddress = (k: keyof NonNullable<SeoSettings["contactInfo"]["address"]>, v: string) =>
    setContact("address", { ...(data.contactInfo.address ?? {}), [k]: v });

  return (
    <div className="space-y-5">
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Social media links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
            <Field key={key} label={label}>
              <div className="flex gap-2 items-center">
                <div className="rounded-md border border-rule bg-white p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <Input
                  value={data.socialLinks[key] ?? ""}
                  onChange={(e) => setSocial(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            </Field>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Analytics & tracking</h3>
        <p className="text-xs text-muted">
          Tracking pixels are auto-injected into the site head. Prefer GTM when both GA and GTM are set.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Google Site Verification" help="Code only — no <meta> wrapper.">
            <Input
              value={data.googleSiteVerification}
              onChange={(e) => set("googleSiteVerification", e.target.value)}
              placeholder="abc123…"
            />
          </Field>
          <Field label="Google Analytics ID" help="G-XXXXXXXXXX">
            <Input
              value={data.googleAnalyticsId}
              onChange={(e) => set("googleAnalyticsId", e.target.value)}
              placeholder="G-…"
            />
          </Field>
          <Field label="Google Tag Manager ID" help="GTM-XXXXXX">
            <Input
              value={data.googleTagManagerId}
              onChange={(e) => set("googleTagManagerId", e.target.value)}
              placeholder="GTM-…"
            />
          </Field>
          <Field label="Facebook Pixel ID">
            <Input
              value={data.facebookPixelId}
              onChange={(e) => set("facebookPixelId", e.target.value)}
              placeholder="123456789…"
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
          Business contact (for schema + OG tags)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Phone">
            <Input
              value={data.contactInfo.phone ?? ""}
              onChange={(e) => setContact("phone", e.target.value)}
              placeholder="+91 …"
            />
          </Field>
          <Field label="Email">
            <Input
              value={data.contactInfo.email ?? ""}
              onChange={(e) => setContact("email", e.target.value)}
              placeholder="hello@nakshaconstruction.com"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Street address">
            <Input
              value={data.contactInfo.address?.street ?? ""}
              onChange={(e) => setAddress("street", e.target.value)}
            />
          </Field>
          <Field label="City">
            <Input
              value={data.contactInfo.address?.city ?? ""}
              onChange={(e) => setAddress("city", e.target.value)}
            />
          </Field>
          <Field label="State / region">
            <Input
              value={data.contactInfo.address?.state ?? ""}
              onChange={(e) => setAddress("state", e.target.value)}
            />
          </Field>
          <Field label="Postal code">
            <Input
              value={data.contactInfo.address?.postalCode ?? ""}
              onChange={(e) => setAddress("postalCode", e.target.value)}
            />
          </Field>
          <Field label="Country" help='ISO code, e.g. "IN".'>
            <Input
              value={data.contactInfo.address?.country ?? ""}
              onChange={(e) => setAddress("country", e.target.value)}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
