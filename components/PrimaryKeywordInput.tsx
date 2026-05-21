"use client";

import { Input } from "./ui";

// Single focus-keyword input. Visually distinguished from the secondary chip
// row by a leading green dot, so editors can tell at a glance which row is
// the one keyword the page is optimised for.

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function PrimaryKeywordInput({ value, onChange, placeholder }: Props) {
  return (
    <div className="space-y-1">
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-500"
          aria-hidden
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "e.g. construction company Jaipur"}
          className="pl-6"
        />
      </div>
      <p className="text-[11px] text-muted">
        The one focus keyword this page is optimised for.
      </p>
    </div>
  );
}
