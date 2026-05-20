"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Image as ImageIcon,
  Type,
  BarChart3,
  Quote,
  Megaphone,
  ListOrdered,
  HeartHandshake,
  Mail,
  AlignLeft,
  Newspaper,
  Building2,
  Wrench,
  Users,
  MapPin,
  Images,
  Youtube,
  AtSign,
  Map as MapIcon,
  Columns,
  Bookmark,
  LayoutGrid,
} from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";
import { ImagePicker } from "./ImagePicker";
import { ImageArrayPicker } from "./ImageArrayPicker";
import { RichTextEditor } from "./RichTextEditor";

// ── Block types ──────────────────────────────────────────────────────────────
type AnyBlock = Record<string, unknown> & { type: string };

type BlockDef = {
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  defaults: () => AnyBlock;
  Editor: React.ComponentType<{ value: AnyBlock; onChange: (v: AnyBlock) => void }>;
};

// ── Editors per block type ───────────────────────────────────────────────────

function strField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function HeroEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <Field label="Eyebrow" help="Small label above the title.">
        <Input value={strField(value.eyebrow)} onChange={(e) => set("eyebrow", e.target.value)} />
      </Field>
      <Field label="Title">
        <Input value={strField(value.title)} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Subtitle">
        <RichTextEditor
          id="hero-subtitle"
          value={strField(value.subtitle)}
          onChange={(html) => set("subtitle", html)}
        />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="CTA label">
          <Input value={strField(value.ctaLabel)} onChange={(e) => set("ctaLabel", e.target.value)} />
        </Field>
        <Field label="CTA URL">
          <Input value={strField(value.ctaHref)} onChange={(e) => set("ctaHref", e.target.value)} />
        </Field>
      </div>
      <Field label="Background image" help="Used as the hero backdrop.">
        <ImagePicker
          value={strField(value.image) || null}
          onChange={(url) => set("image", url ?? "")}
          recommendedSize="1920×1080px (16:9 full bleed)"
        />
      </Field>
      <Field label="Image alt text" help="Describe the image for screen readers and SEO.">
        <Input
          value={strField(value.imageAlt)}
          onChange={(e) => set("imageAlt", e.target.value)}
          placeholder="e.g. Construction site at Civil Lines, Jaipur"
        />
      </Field>
      <Field label="Banner size" help="Use the largest only on the home page.">
        <Select
          value={(typeof value.size === "string" && value.size) || "full"}
          onChange={(e) => set("size", e.target.value)}
        >
          <option value="full">Full screen (home page)</option>
          <option value="lg">Large (78% viewport)</option>
          <option value="md">Medium (55% viewport)</option>
          <option value="sm">Small (40% viewport)</option>
        </Select>
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Alignment" help="Centered works best for title-only banners.">
          <Select
            value={(typeof value.alignment === "string" && value.alignment) || "left"}
            onChange={(e) => set("alignment", e.target.value)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
          </Select>
        </Field>
        <Field
          label="Overlay strength"
          help="How dark the tint over the background image is."
        >
          <Select
            value={(typeof value.overlayStrength === "string" && value.overlayStrength) || "medium"}
            onChange={(e) => set("overlayStrength", e.target.value)}
          >
            <option value="soft">Soft (30%)</option>
            <option value="medium">Medium (45%)</option>
            <option value="heavy">Heavy (65%)</option>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function StatsEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const items = Array.isArray(value.items)
    ? (value.items as { value: string; label: string }[])
    : [];
  const update = (i: number, patch: Partial<{ value: string; label: string }>) => {
    onChange({
      ...value,
      items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    });
  };
  const add = () => onChange({ ...value, items: [...items, { value: "", label: "" }] });
  const remove = (i: number) =>
    onChange({ ...value, items: items.filter((_, idx) => idx !== i) });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ ...value, items: next });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wider">Stat items</p>
        <Button variant="ghost" type="button" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add stat
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted py-2">No stats yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr_2fr_auto] items-center gap-2">
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-muted hover:text-ink disabled:opacity-30"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="text-muted hover:text-ink disabled:opacity-30"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              <Input
                value={it.value ?? ""}
                onChange={(e) => update(i, { value: e.target.value })}
                placeholder="11+"
              />
              <Input
                value={it.label ?? ""}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Years of practice"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IntroEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <Field label="Heading (eyebrow)">
        <Input value={strField(value.heading)} onChange={(e) => set("heading", e.target.value)} />
      </Field>
      <Field label="Body">
        <RichTextEditor
          id="intro-body"
          value={strField(value.body)}
          onChange={(html) => set("body", html)}
        />
      </Field>
    </div>
  );
}

function CtaEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <Field label="Heading">
        <Input value={strField(value.heading)} onChange={(e) => set("heading", e.target.value)} />
      </Field>
      <Field label="Sub-heading">
        <RichTextEditor
          id="cta-sub"
          value={strField(value.sub)}
          onChange={(html) => set("sub", html)}
        />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="CTA label">
          <Input value={strField(value.ctaLabel)} onChange={(e) => set("ctaLabel", e.target.value)} />
        </Field>
        <Field label="CTA URL">
          <Input value={strField(value.ctaHref)} onChange={(e) => set("ctaHref", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function LongformEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <Field label="Body" help="Use the editor toolbar to format text, add headings, lists, and links.">
      <RichTextEditor
        id="longform-body"
        value={strField(value.body)}
        onChange={(html) => set("body", html)}
        minHeight={280}
      />
    </Field>
  );
}

function TimelineEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  type Item = { year: string; title: string; body: string };
  const items: Item[] = Array.isArray(value.items) ? (value.items as Item[]) : [];
  const update = (i: number, patch: Partial<Item>) =>
    onChange({ ...value, items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const add = () => onChange({ ...value, items: [...items, { year: "", title: "", body: "" }] });
  const remove = (i: number) =>
    onChange({ ...value, items: items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wider">Timeline entries</p>
        <Button variant="ghost" type="button" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add entry
        </Button>
      </div>
      {items.map((it, i) => (
        <div key={i} className="rounded-md border border-rule bg-rule/10 p-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-2">
            <Input
              placeholder="2024"
              value={it.year ?? ""}
              onChange={(e) => update(i, { year: e.target.value })}
            />
            <Input
              placeholder="Milestone title"
              value={it.title ?? ""}
              onChange={(e) => update(i, { title: e.target.value })}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-600 hover:text-red-700 p-1 self-center"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <RichTextEditor
            id={`timeline-${i}-body`}
            value={it.body ?? ""}
            onChange={(html) => update(i, { body: html })}
            minHeight={160}
          />
        </div>
      ))}
    </div>
  );
}

function CommitmentsEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  type Item = { key?: string; title: string; body: string; image?: string; imageAlt?: string };
  const items: Item[] = Array.isArray(value.items) ? (value.items as Item[]) : [];
  const update = (i: number, patch: Partial<Item>) =>
    onChange({ ...value, items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const add = () =>
    onChange({ ...value, items: [...items, { title: "", body: "", image: "", imageAlt: "" }] });
  const remove = (i: number) =>
    onChange({ ...value, items: items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wider">Commitments</p>
        <Button variant="ghost" type="button" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add commitment
        </Button>
      </div>
      {items.map((it, i) => (
        <div key={i} className="rounded-md border border-rule bg-rule/10 p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-start">
            <Input
              placeholder="Title"
              value={it.title ?? ""}
              onChange={(e) => update(i, { title: e.target.value })}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-600 hover:text-red-700 p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <RichTextEditor
            id={`commitment-${i}-body`}
            value={it.body ?? ""}
            onChange={(html) => update(i, { body: html })}
            minHeight={160}
          />
          <Field label="Image (optional)">
            <ImagePicker
              value={it.image ?? null}
              onChange={(url) => update(i, { image: url ?? "" })}
              recommendedSize="1400×900px (16:10 landscape)"
            />
          </Field>
          <Field label="Image alt text">
            <Input
              value={it.imageAlt ?? ""}
              onChange={(e) => update(i, { imageAlt: e.target.value })}
              placeholder="Describe the image for accessibility"
            />
          </Field>
        </div>
      ))}
    </div>
  );
}

function GalleryEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const items = Array.isArray(value.items) ? (value.items as { url: string; alt?: string }[]) : [];
  const columns = typeof value.columns === "number" ? (value.columns as 2 | 3 | 4) : 3;
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <Field label="Heading (eyebrow)" help="Small label above the grid.">
        <Input value={strField(value.heading)} onChange={(e) => set("heading", e.target.value)} />
      </Field>
      <Field label="Intro (optional)">
        <Input value={strField(value.intro)} onChange={(e) => set("intro", e.target.value)} />
      </Field>
      <Field label="Columns at desktop">
        <Select value={String(columns)} onChange={(e) => set("columns", Number(e.target.value))}>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </Select>
      </Field>
      <Field label="Images" help="Click a card to set alt text. Drag to reorder.">
        <ImageArrayPicker
          value={items}
          onChange={(next) => set("items", next)}
          recommendedSize="1200×900px (4:3) — gallery thumbs"
        />
      </Field>
    </div>
  );
}

function MapEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  const lat = typeof value.lat === "number" ? value.lat : "";
  const lng = typeof value.lng === "number" ? value.lng : "";
  const zoom = typeof value.zoom === "number" ? value.zoom : 16;
  const setNum = (k: string, raw: string) => set(k, raw === "" ? undefined : Number(raw));
  return (
    <div className="space-y-4">
      <Field label="Heading (optional)">
        <Input value={strField(value.heading)} onChange={(e) => set("heading", e.target.value)} />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Latitude" help="e.g. 26.8529953">
          <Input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setNum("lat", e.target.value)}
          />
        </Field>
        <Field label="Longitude" help="e.g. 75.8076847">
          <Input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setNum("lng", e.target.value)}
          />
        </Field>
        <Field label="Zoom" help="1 (world) – 20 (street)">
          <Input
            type="number"
            min={1}
            max={20}
            value={zoom}
            onChange={(e) => setNum("zoom", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Height">
        <Select
          value={typeof value.height === "string" ? value.height : "md"}
          onChange={(e) => set("height", e.target.value)}
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </Select>
      </Field>
      <Field
        label="Custom embed URL (advanced, optional)"
        help="Overrides lat/lng. Paste a `https://www.google.com/maps/embed?...` URL."
      >
        <Input value={strField(value.embedUrl)} onChange={(e) => set("embedUrl", e.target.value)} />
      </Field>
      <Field label="Open-in-maps link label" help="Defaults to 'Open in Google Maps →'.">
        <Input value={strField(value.linkLabel)} onChange={(e) => set("linkLabel", e.target.value)} />
      </Field>
    </div>
  );
}

function EmailQueryEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <Field label="Heading" help="Shown above the form. Defaults to 'Send us a quick message'.">
        <Input value={strField(value.heading)} onChange={(e) => set("heading", e.target.value)} />
      </Field>
      <Field label="Intro line">
        <Input value={strField(value.intro)} onChange={(e) => set("intro", e.target.value)} />
      </Field>
      <Field label="Button label" help="Defaults to 'Send message'.">
        <Input value={strField(value.ctaLabel)} onChange={(e) => set("ctaLabel", e.target.value)} />
      </Field>
      <p className="text-xs text-muted">
        Submissions land in the Contact inbox. Fields are fixed: name, email, subject (optional),
        message.
      </p>
    </div>
  );
}

function ContactFormEditor() {
  return (
    <p className="text-sm text-muted">
      Renders the contact form. No fields to configure — submissions show up in the Contact inbox.
    </p>
  );
}

function makeSourceEditor(label: string, source: string) {
  return function SourceEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
    // ensure source is set
    if (value.source !== source) onChange({ ...value, source });
    return (
      <p className="text-sm text-muted">
        Auto-renders the {label} grid from the <strong>{source}</strong> collection. Edit the
        items in the corresponding sidebar section.
      </p>
    );
  };
}

function makeLimitedSourceEditor(label: string, source: string) {
  return function LimitedSourceEditor({
    value,
    onChange,
  }: {
    value: AnyBlock;
    onChange: (v: AnyBlock) => void;
  }) {
    const limit = typeof value.limit === "number" ? value.limit : "";
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          Renders {label} from the <strong>{source}</strong> collection.
        </p>
        <Field label="Max items" help="Leave empty to show all.">
          <Input
            type="number"
            value={limit}
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                ...value,
                source,
                limit: v === "" ? undefined : Number(v),
              });
            }}
          />
        </Field>
      </div>
    );
  };
}

function LocationsEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Renders the locations grid from the <strong>locations</strong> collection.
      </p>
      <Field label="Compact mode">
        <Select
          value={value.compact ? "true" : "false"}
          onChange={(e) =>
            onChange({ ...value, source: "locations", compact: e.target.value === "true" })
          }
        >
          <option value="false">No — full layout</option>
          <option value="true">Yes — compact (e.g. inline on contact page)</option>
        </Select>
      </Field>
    </div>
  );
}

function TwoColumnEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  const bullets = Array.isArray(value.bullets) ? (value.bullets as string[]) : [];
  const image =
    typeof value.image === "object" && value.image
      ? (value.image as { url: string; alt: string })
      : null;
  const updateBullet = (i: number, v: string) =>
    set(
      "bullets",
      bullets.map((b, idx) => (idx === i ? v : b)),
    );
  const addBullet = () => set("bullets", [...bullets, ""]);
  const removeBullet = (i: number) =>
    set(
      "bullets",
      bullets.filter((_, idx) => idx !== i),
    );
  const moveBullet = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= bullets.length) return;
    const next = [...bullets];
    [next[i], next[j]] = [next[j], next[i]];
    set("bullets", next);
  };
  return (
    <div className="space-y-4">
      <Field label="Eyebrow (optional)">
        <Input value={strField(value.eyebrow)} onChange={(e) => set("eyebrow", e.target.value)} />
      </Field>
      <Field label="Heading" required>
        <Input value={strField(value.heading)} onChange={(e) => set("heading", e.target.value)} />
      </Field>
      <Field label="Body" help="Rich text — supports headings, lists, links.">
        <RichTextEditor
          id="twocol-body"
          value={strField(value.body)}
          onChange={(html) => set("body", html)}
        />
      </Field>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Bullets (optional)</p>
          <Button variant="ghost" type="button" onClick={addBullet}>
            <Plus className="h-3.5 w-3.5" /> Add bullet
          </Button>
        </div>
        {bullets.length === 0 ? (
          <p className="text-xs text-muted">No bullets — leave empty to skip the list.</p>
        ) : (
          <ul className="space-y-2">
            {bullets.map((b, i) => (
              <li key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => moveBullet(i, -1)}
                    disabled={i === 0}
                    className="text-muted hover:text-ink disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBullet(i, 1)}
                    disabled={i === bullets.length - 1}
                    className="text-muted hover:text-ink disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <Input value={b} onChange={(e) => updateBullet(i, e.target.value)} />
                <button
                  type="button"
                  onClick={() => removeBullet(i)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Field label="Image">
        <ImagePicker
          value={image?.url ?? null}
          onChange={(url) => set("image", url ? { url, alt: image?.alt ?? "" } : null)}
          recommendedSize="1400×900px (4:3 landscape)"
        />
      </Field>
      {image?.url && (
        <Field label="Image alt text" help="Describe the image for screen readers and SEO.">
          <Input
            value={image.alt}
            onChange={(e) => set("image", { url: image.url, alt: e.target.value })}
          />
        </Field>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Image position">
          <Select
            value={typeof value.imagePosition === "string" ? value.imagePosition : "right"}
            onChange={(e) => set("imagePosition", e.target.value)}
          >
            <option value="right">Right</option>
            <option value="left">Left</option>
          </Select>
        </Field>
        <Field label="Background">
          <Select
            value={typeof value.background === "string" ? value.background : "paper"}
            onChange={(e) => set("background", e.target.value)}
          >
            <option value="paper">Paper (white)</option>
            <option value="tint">Tinted</option>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function CtaStripEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  const cta =
    typeof value.cta === "object" && value.cta
      ? (value.cta as { label?: string; href?: string })
      : { label: "", href: "" };
  return (
    <div className="space-y-4">
      <Field label="Text (left side)" required>
        <Input value={strField(value.text)} onChange={(e) => set("text", e.target.value)} />
      </Field>
      <Field label="Sub-text (optional second line)">
        <Input value={strField(value.textSub)} onChange={(e) => set("textSub", e.target.value)} />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Button label" required>
          <Input
            value={cta.label ?? ""}
            onChange={(e) => set("cta", { ...cta, label: e.target.value })}
          />
        </Field>
        <Field label="Button URL" required>
          <Input
            value={cta.href ?? ""}
            onChange={(e) => set("cta", { ...cta, href: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Background">
        <Select
          value={typeof value.background === "string" ? value.background : "tint"}
          onChange={(e) => set("background", e.target.value)}
        >
          <option value="tint">Tinted (default)</option>
          <option value="paper">Paper (white)</option>
          <option value="dark">Dark (ink)</option>
        </Select>
      </Field>
    </div>
  );
}

function StyleCardsEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  const cards = Array.isArray(value.cards)
    ? (value.cards as { heading: string; body: string }[])
    : [];
  const updateCard = (i: number, patch: Partial<{ heading: string; body: string }>) =>
    set(
      "cards",
      cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    );
  const addCard = () => set("cards", [...cards, { heading: "", body: "" }]);
  const removeCard = (i: number) =>
    set(
      "cards",
      cards.filter((_, idx) => idx !== i),
    );
  const moveCard = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= cards.length) return;
    const next = [...cards];
    [next[i], next[j]] = [next[j], next[i]];
    set("cards", next);
  };
  return (
    <div className="space-y-4">
      <Field label="Eyebrow (optional)">
        <Input value={strField(value.eyebrow)} onChange={(e) => set("eyebrow", e.target.value)} />
      </Field>
      <Field label="Section heading (optional)">
        <Input value={strField(value.heading)} onChange={(e) => set("heading", e.target.value)} />
      </Field>
      <Field label="Intro (optional, rich text)">
        <RichTextEditor
          id="stylecards-intro"
          value={strField(value.intro)}
          onChange={(html) => set("intro", html)}
        />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Columns at desktop">
          <Select
            value={String(typeof value.columns === "number" ? value.columns : 3)}
            onChange={(e) => set("columns", Number(e.target.value))}
          >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </Select>
        </Field>
        <Field label="Background">
          <Select
            value={typeof value.background === "string" ? value.background : "tint"}
            onChange={(e) => set("background", e.target.value)}
          >
            <option value="tint">Tinted (default)</option>
            <option value="paper">Paper (white)</option>
          </Select>
        </Field>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Cards</p>
          <Button variant="ghost" type="button" onClick={addCard}>
            <Plus className="h-3.5 w-3.5" /> Add card
          </Button>
        </div>
        {cards.length === 0 ? (
          <p className="text-xs text-muted py-2">No cards yet.</p>
        ) : (
          <ul className="space-y-3">
            {cards.map((c, i) => (
              <li key={i} className="rounded-md border border-rule bg-rule/10 p-3 space-y-2">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => moveCard(i, -1)}
                      disabled={i === 0}
                      className="text-muted hover:text-ink disabled:opacity-30"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCard(i, 1)}
                      disabled={i === cards.length - 1}
                      className="text-muted hover:text-ink disabled:opacity-30"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <Input
                    placeholder="Card heading"
                    value={c.heading}
                    onChange={(e) => updateCard(i, { heading: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeCard(i)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Textarea
                  placeholder="Card body"
                  value={c.body}
                  onChange={(e) => updateCard(i, { body: e.target.value })}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CollageEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  const images = Array.isArray(value.images)
    ? (value.images as { url: string; alt?: string }[])
    : [];
  return (
    <div className="space-y-4">
      <Field label="Layout">
        <Select
          value={typeof value.layout === "string" ? value.layout : "asymmetric-3"}
          onChange={(e) => set("layout", e.target.value)}
        >
          <option value="asymmetric-3">Asymmetric 3-up (Pinterest-style)</option>
          <option value="grid-3">3-column grid</option>
          <option value="grid-4">4-column grid</option>
        </Select>
      </Field>
      <Field label="Images" help="For asymmetric layout, add exactly 3 images.">
        <ImageArrayPicker
          value={images}
          onChange={(next) => set("images", next)}
          recommendedSize="1200×900px"
        />
      </Field>
    </div>
  );
}

function VideoGalleryEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  type Video = { url: string; title: string };
  const videos: Video[] = Array.isArray(value.videos) ? (value.videos as Video[]) : [];
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  const updateVideo = (i: number, patch: Partial<Video>) =>
    onChange({
      ...value,
      videos: videos.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    });
  const addVideo = () => onChange({ ...value, videos: [...videos, { url: "", title: "" }] });
  const removeVideo = (i: number) =>
    onChange({ ...value, videos: videos.filter((_, idx) => idx !== i) });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= videos.length) return;
    const next = [...videos];
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ ...value, videos: next });
  };
  return (
    <div className="space-y-4">
      <Field label="Heading">
        <Input value={strField(value.heading)} onChange={(e) => set("heading", e.target.value)} />
      </Field>
      <Field label="Intro (optional)">
        <RichTextEditor
          id="video-gallery-intro"
          value={strField(value.intro)}
          onChange={(html) => set("intro", html)}
        />
      </Field>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Videos</p>
          <Button variant="ghost" type="button" onClick={addVideo}>
            <Plus className="h-3.5 w-3.5" /> Add video
          </Button>
        </div>
        {videos.map((v, i) => (
          <div key={i} className="rounded-md border border-rule bg-rule/10 p-3 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
              <Input
                placeholder="Title"
                value={v.title ?? ""}
                onChange={(e) => updateVideo(i, { title: e.target.value })}
              />
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-muted hover:text-ink p-1 disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === videos.length - 1}
                className="text-muted hover:text-ink p-1 disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeVideo(i)}
                className="text-red-600 hover:text-red-700 p-1"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Input
              placeholder="YouTube URL (watch / embed / shorts / youtu.be)"
              value={v.url ?? ""}
              onChange={(e) => updateVideo(i, { url: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Channel URL">
          <Input
            placeholder="https://www.youtube.com/@yourchannel"
            value={strField(value.channelUrl)}
            onChange={(e) => set("channelUrl", e.target.value)}
          />
        </Field>
        <Field label="Channel link label">
          <Input
            placeholder="See more on YouTube"
            value={strField(value.channelLinkLabel)}
            onChange={(e) => set("channelLinkLabel", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

function SplitFeatureEditor({ value, onChange }: { value: AnyBlock; onChange: (v: AnyBlock) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  const cards = Array.isArray(value.cards)
    ? (value.cards as { title: string; body?: string; icon?: string }[])
    : [];
  const bg = typeof value.background === "string" ? value.background : "dark";
  const backgroundImage =
    typeof value.backgroundImage === "object" && value.backgroundImage
      ? (value.backgroundImage as { url: string; alt: string })
      : null;
  const updateCard = (i: number, patch: Partial<{ title: string; body: string; icon: string }>) =>
    set(
      "cards",
      cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    );
  const addCard = () => set("cards", [...cards, { title: "", body: "", icon: "" }]);
  const removeCard = (i: number) =>
    set(
      "cards",
      cards.filter((_, idx) => idx !== i),
    );
  const moveCard = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= cards.length) return;
    const next = [...cards];
    [next[i], next[j]] = [next[j], next[i]];
    set("cards", next);
  };
  return (
    <div className="space-y-4">
      <Field label="Eyebrow (optional)">
        <Input value={strField(value.eyebrow)} onChange={(e) => set("eyebrow", e.target.value)} />
      </Field>
      <Field label="Heading" required>
        <Input value={strField(value.heading)} onChange={(e) => set("heading", e.target.value)} />
      </Field>
      <Field label="Body" help="Rich text — supports headings, lists, links.">
        <RichTextEditor
          id="splitfeature-body"
          value={strField(value.body)}
          onChange={(html) => set("body", html)}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Text position">
          <Select
            value={typeof value.textPosition === "string" ? value.textPosition : "left"}
            onChange={(e) => set("textPosition", e.target.value)}
          >
            <option value="left">Text left, cards right</option>
            <option value="right">Cards left, text right</option>
          </Select>
        </Field>
        <Field label="Background">
          <Select value={bg} onChange={(e) => set("background", e.target.value)}>
            <option value="paper">Paper (white)</option>
            <option value="tint">Tinted</option>
            <option value="dark">Dark</option>
            <option value="image">Image with overlay</option>
          </Select>
        </Field>
      </div>
      {bg === "image" && (
        <>
          <Field label="Background image">
            <ImagePicker
              value={backgroundImage?.url ?? null}
              onChange={(url) =>
                set("backgroundImage", url ? { url, alt: backgroundImage?.alt ?? "" } : null)
              }
              recommendedSize="2400×1400px (wide hero)"
            />
          </Field>
          {backgroundImage?.url && (
            <Field label="Background image alt">
              <Input
                value={backgroundImage.alt}
                onChange={(e) =>
                  set("backgroundImage", { url: backgroundImage.url, alt: e.target.value })
                }
              />
            </Field>
          )}
        </>
      )}
      {(bg === "image" || bg === "dark") && (
        <Field label="Overlay strength" help="Darkens the background so the text stays readable.">
          <Select
            value={typeof value.overlayStrength === "string" ? value.overlayStrength : "medium"}
            onChange={(e) => set("overlayStrength", e.target.value)}
          >
            <option value="soft">Soft</option>
            <option value="medium">Medium</option>
            <option value="heavy">Heavy</option>
          </Select>
        </Field>
      )}
      <Field label="Card columns">
        <Select
          value={String(typeof value.cardColumns === "number" ? value.cardColumns : 2)}
          onChange={(e) => set("cardColumns", Number(e.target.value))}
        >
          <option value="2">2 (2×2 grid)</option>
          <option value="3">3 (3-up grid)</option>
        </Select>
      </Field>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Cards</p>
          <Button variant="ghost" type="button" onClick={addCard}>
            <Plus className="h-3.5 w-3.5" /> Add card
          </Button>
        </div>
        {cards.length === 0 ? (
          <p className="text-xs text-muted">No cards — add at least one to populate the grid.</p>
        ) : (
          <ul className="space-y-3">
            {cards.map((c, i) => (
              <li key={i} className="rounded-md border border-rule p-3">
                <div className="grid grid-cols-[auto_1fr_auto] items-start gap-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => moveCard(i, -1)}
                      disabled={i === 0}
                      className="text-muted hover:text-ink disabled:opacity-30"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCard(i, 1)}
                      disabled={i === cards.length - 1}
                      className="text-muted hover:text-ink disabled:opacity-30"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Title"
                      value={c.title ?? ""}
                      onChange={(e) => updateCard(i, { title: e.target.value })}
                    />
                    <Input
                      placeholder="Body (optional)"
                      value={c.body ?? ""}
                      onChange={(e) => updateCard(i, { body: e.target.value })}
                    />
                    <Input
                      placeholder="Icon — lucide name (Handshake, Users, PencilRuler, House, Hammer, HardHat, Building2, ClipboardCheck) or paste an image URL"
                      value={c.icon ?? ""}
                      onChange={(e) => updateCard(i, { icon: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCard(i)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Block registry ───────────────────────────────────────────────────────────
const BLOCK_DEFS: Record<string, BlockDef> = {
  hero: {
    label: "Hero",
    description: "Big intro at the top of a page.",
    icon: ImageIcon,
    defaults: () => ({
      type: "hero",
      title: "",
      subtitle: "",
      ctaLabel: "",
      ctaHref: "",
      alignment: "left",
      overlayStrength: "medium",
    }),
    Editor: HeroEditor,
  },
  stats: {
    label: "Stats strip",
    description: "Animated counter strip with label/value pairs.",
    icon: BarChart3,
    defaults: () => ({ type: "stats", items: [] }),
    Editor: StatsEditor,
  },
  intro: {
    label: "Intro block",
    description: "Eyebrow heading + paragraph.",
    icon: Type,
    defaults: () => ({ type: "intro", heading: "", body: "" }),
    Editor: IntroEditor,
  },
  cta: {
    label: "Call to action",
    description: "Banner with heading and CTA button.",
    icon: Megaphone,
    defaults: () => ({ type: "cta", heading: "", ctaLabel: "", ctaHref: "" }),
    Editor: CtaEditor,
  },
  longform: {
    label: "Longform text",
    description: "Plain paragraphs of body copy.",
    icon: AlignLeft,
    defaults: () => ({ type: "longform", body: "" }),
    Editor: LongformEditor,
  },
  timeline: {
    label: "Timeline",
    description: "Year / title / body entries on a vertical line.",
    icon: ListOrdered,
    defaults: () => ({ type: "timeline", items: [] }),
    Editor: TimelineEditor,
  },
  commitments: {
    label: "Commitments grid",
    description: "Grid of title/body cards (used on Sustainability).",
    icon: HeartHandshake,
    defaults: () => ({ type: "commitments", items: [] }),
    Editor: CommitmentsEditor,
  },
  gallery: {
    label: "Image gallery",
    description: "Grid of images with optional captions on hover.",
    icon: Images,
    defaults: () => ({ type: "gallery", items: [], columns: 3 }),
    Editor: GalleryEditor,
  },
  contactForm: {
    label: "Contact form",
    description: "Embeds the public contact form.",
    icon: Mail,
    defaults: () => ({ type: "contactForm" }),
    Editor: ContactFormEditor,
  },
  emailQuery: {
    label: "Email query box",
    description: "Compact name/email/subject/message form that lands in the Contact inbox.",
    icon: AtSign,
    defaults: () => ({ type: "emailQuery" }),
    Editor: EmailQueryEditor,
  },
  map: {
    label: "Map",
    description: "Embedded Google map. Paste lat/lng or a Google embed URL.",
    icon: MapIcon,
    defaults: () => ({
      type: "map",
      heading: "Find us",
      lat: 26.8529953,
      lng: 75.8076847,
      zoom: 16,
      height: "md",
    }),
    Editor: MapEditor,
  },
  testimonials: {
    label: "Testimonials",
    description: "Grid of quotes from the Testimonials collection.",
    icon: Quote,
    defaults: () => ({ type: "testimonials", source: "testimonials" }),
    Editor: makeSourceEditor("testimonials", "testimonials"),
  },
  servicesGrid: {
    label: "Services grid",
    description: "Grid of all services from the Services collection.",
    icon: Wrench,
    defaults: () => ({ type: "servicesGrid", source: "services" }),
    Editor: makeSourceEditor("services", "services"),
  },
  projectsGrid: {
    label: "Projects grid (all)",
    icon: Building2,
    defaults: () => ({ type: "projectsGrid", source: "projects" }),
    Editor: makeLimitedSourceEditor("the full project grid", "projects"),
  },
  projectsFeatured: {
    label: "Projects — featured",
    description: "A limited subset of projects, e.g. for the home page.",
    icon: Building2,
    defaults: () => ({ type: "projectsFeatured", source: "projects", limit: 6 }),
    Editor: makeLimitedSourceEditor("featured projects", "projects"),
  },
  articlesGrid: {
    label: "Articles grid",
    icon: Newspaper,
    defaults: () => ({ type: "articlesGrid", source: "articles" }),
    Editor: makeLimitedSourceEditor("articles", "articles"),
  },
  leadership: {
    label: "Leadership grid",
    icon: Users,
    defaults: () => ({ type: "leadership", source: "leaders" }),
    Editor: makeSourceEditor("leadership", "leaders"),
  },
  locationsGrid: {
    label: "Locations grid",
    icon: MapPin,
    defaults: () => ({ type: "locationsGrid", source: "locations", compact: false }),
    Editor: LocationsEditor,
  },
  twoColumn: {
    label: "Two-column",
    description: "Side-by-side heading + rich text + optional bullets, with an image.",
    icon: Columns,
    defaults: () => ({
      type: "twoColumn",
      eyebrow: "",
      heading: "",
      body: "",
      bullets: [],
      image: null,
      imagePosition: "right",
      background: "paper",
    }),
    Editor: TwoColumnEditor,
  },
  ctaStrip: {
    label: "CTA strip",
    description: "Full-width band with a green serif line on the left and a button on the right.",
    icon: Bookmark,
    defaults: () => ({
      type: "ctaStrip",
      text: "",
      textSub: "",
      cta: { label: "Contact us", href: "/contact" },
      background: "tint",
    }),
    Editor: CtaStripEditor,
  },
  styleCards: {
    label: "Style cards",
    description: "Heading + grid of text-only cards (used for the interior styles section).",
    icon: LayoutGrid,
    defaults: () => ({
      type: "styleCards",
      eyebrow: "",
      heading: "",
      intro: "",
      columns: 3,
      background: "tint",
      cards: [],
    }),
    Editor: StyleCardsEditor,
  },
  collage: {
    label: "Image collage",
    description: "Pinterest-style 3-image collage or a regular 3/4-column image grid.",
    icon: Images,
    defaults: () => ({ type: "collage", layout: "asymmetric-3", images: [] }),
    Editor: CollageEditor,
  },
  videoGallery: {
    label: "Video gallery",
    description: "Grid of YouTube videos with optional channel link.",
    icon: Youtube,
    defaults: () => ({
      type: "videoGallery",
      heading: "",
      intro: "",
      videos: [],
      channelUrl: "",
      channelLinkLabel: "See more on YouTube",
    }),
    Editor: VideoGalleryEditor,
  },
  splitFeature: {
    label: "Split feature",
    description: "Two-column band: text on one side, card grid on the other. Supports a dark/image background.",
    icon: LayoutGrid,
    defaults: () => ({
      type: "splitFeature",
      eyebrow: "",
      heading: "",
      body: "",
      textPosition: "left",
      background: "dark",
      backgroundImage: null,
      overlayStrength: "heavy",
      cards: [],
      cardColumns: 2,
    }),
    Editor: SplitFeatureEditor,
  },
};

// Groups for the picker modal — purely visual; types/keys are unchanged.
const BLOCK_GROUPS: { heading: string; keys: string[] }[] = [
  { heading: "Banners & CTAs", keys: ["hero", "ctaStrip", "cta"] },
  { heading: "Content sections", keys: ["intro", "twoColumn", "splitFeature", "longform", "styleCards"] },
  { heading: "Imagery", keys: ["gallery", "collage", "videoGallery"] },
  {
    heading: "Lists & data",
    keys: [
      "stats",
      "timeline",
      "commitments",
      "testimonials",
      "servicesGrid",
      "projectsGrid",
      "projectsFeatured",
      "articlesGrid",
      "leadership",
      "locationsGrid",
    ],
  },
  { heading: "Forms & contact", keys: ["contactForm", "emailQuery", "map"] },
];

// ── Main editor ──────────────────────────────────────────────────────────────
export function BlocksEditor({
  value,
  onChange,
}: {
  value: AnyBlock[];
  onChange: (v: AnyBlock[]) => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(value.length === 0 ? null : 0);
  const [picker, setPicker] = useState(false);

  const update = (i: number, patch: AnyBlock) =>
    onChange(value.map((b, idx) => (idx === i ? patch : b)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = (type: string) => {
    const def = BLOCK_DEFS[type];
    if (!def) return;
    onChange([...value, def.defaults()]);
    setOpenIdx(value.length);
    setPicker(false);
  };

  return (
    <div className="space-y-3">
      {value.map((block, i) => {
        const def = BLOCK_DEFS[block.type];
        const Icon = def?.icon ?? AlignLeft;
        const isOpen = openIdx === i;
        return (
          <Card key={i} className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-rule bg-rule/20">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="flex items-center gap-2 text-left flex-1 min-w-0"
              >
                <Icon className="h-4 w-4 text-muted shrink-0" />
                <span className="text-sm font-medium truncate">
                  {def?.label ?? block.type}
                </span>
                <span className="text-xs text-muted truncate">
                  {previewLabel(block)}
                </span>
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-muted hover:text-ink disabled:opacity-30 p-1"
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  className="text-muted hover:text-ink disabled:opacity-30 p-1"
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove "${def?.label ?? block.type}" block?`)) remove(i);
                  }}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="p-4">
                {def ? (
                  <def.Editor value={block} onChange={(v) => update(i, v)} />
                ) : (
                  <p className="text-sm text-red-600">Unknown block type: {block.type}</p>
                )}
              </div>
            )}
          </Card>
        );
      })}

      {picker ? (
        <Card className="p-4">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
            Choose a block to add
          </p>
          <div className="space-y-5">
            {BLOCK_GROUPS.map((group) => {
              const keys = group.keys.filter((k) => BLOCK_DEFS[k]);
              if (keys.length === 0) return null;
              return (
                <div key={group.heading}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {group.heading}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {keys.map((k) => {
                      const def = BLOCK_DEFS[k];
                      const Icon = def.icon;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => add(k)}
                          className="text-left rounded-md border border-rule bg-white p-3 hover:border-ink"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted" />
                            <span className="text-sm font-medium">{def.label}</span>
                          </div>
                          {def.description && (
                            <p className="mt-1 text-xs text-muted">{def.description}</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <Button variant="secondary" type="button" onClick={() => setPicker(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="secondary" type="button" onClick={() => setPicker(true)}>
          <Plus className="h-4 w-4" /> Add block
        </Button>
      )}
    </div>
  );
}

function previewLabel(block: AnyBlock): string {
  if (typeof block.title === "string" && block.title) return `— ${block.title}`;
  if (typeof block.heading === "string" && block.heading) return `— ${block.heading}`;
  return "";
}
