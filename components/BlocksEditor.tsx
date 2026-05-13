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
  Grid2x2,
  Briefcase,
  Newspaper,
  Building2,
  Wrench,
  Users,
  MapPin,
} from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";
import { ImagePicker } from "./ImagePicker";
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
  type Item = { key?: string; title: string; body: string; image?: string };
  const items: Item[] = Array.isArray(value.items) ? (value.items as Item[]) : [];
  const update = (i: number, patch: Partial<Item>) =>
    onChange({ ...value, items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const add = () =>
    onChange({ ...value, items: [...items, { title: "", body: "", image: "" }] });
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
        </div>
      ))}
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

// ── Block registry ───────────────────────────────────────────────────────────
const BLOCK_DEFS: Record<string, BlockDef> = {
  hero: {
    label: "Hero",
    description: "Big intro at the top of a page.",
    icon: ImageIcon,
    defaults: () => ({ type: "hero", title: "", subtitle: "", ctaLabel: "", ctaHref: "" }),
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
  contactForm: {
    label: "Contact form",
    description: "Embeds the public contact form.",
    icon: Mail,
    defaults: () => ({ type: "contactForm" }),
    Editor: ContactFormEditor,
  },
  testimonials: {
    label: "Testimonials",
    description: "Grid of quotes from the Testimonials collection.",
    icon: Quote,
    defaults: () => ({ type: "testimonials", source: "testimonials" }),
    Editor: makeSourceEditor("testimonials", "testimonials"),
  },
  marketsGrid: {
    label: "Markets grid",
    description: "Grid of all markets from the Markets collection.",
    icon: Grid2x2,
    defaults: () => ({ type: "marketsGrid", source: "markets" }),
    Editor: makeSourceEditor("markets", "markets"),
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
  openRoles: {
    label: "Open roles",
    description: "Pulls from the Jobs collection.",
    icon: Briefcase,
    defaults: () => ({ type: "openRoles", source: "jobs" }),
    Editor: makeSourceEditor("open roles", "jobs"),
  },
  locationsGrid: {
    label: "Locations grid",
    icon: MapPin,
    defaults: () => ({ type: "locationsGrid", source: "locations", compact: false }),
    Editor: LocationsEditor,
  },
};

const BLOCK_TYPE_KEYS = Object.keys(BLOCK_DEFS);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {BLOCK_TYPE_KEYS.map((k) => {
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
          <div className="mt-3">
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
