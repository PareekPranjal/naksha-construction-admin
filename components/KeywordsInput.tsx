"use client";

import { useEffect, useState } from "react";
import { Input } from "./ui";

// Comma-separated tags input that's safe to type into.
// The previous pattern (split→trim→filter on every keystroke) wiped spaces
// and trailing commas mid-typing. This component keeps the raw draft text in
// local state, syncs the parsed string[] up to the parent on every change,
// and re-formats on blur.

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  separator?: string; // defaults to ","
};

function parse(text: string, sep: string): string[] {
  return text
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function KeywordsInput({ value, onChange, placeholder, separator = "," }: Props) {
  const [draft, setDraft] = useState<string>(() => value.join(`${separator} `));

  // If the parent value changes from elsewhere (e.g. initial load or reset),
  // re-sync the draft. We compare against the parsed draft so user typing
  // (which produces an unfinished draft) doesn't get overwritten.
  useEffect(() => {
    const parsedDraft = parse(draft, separator);
    const same =
      parsedDraft.length === value.length && parsedDraft.every((v, i) => v === value[i]);
    if (!same) {
      setDraft(value.join(`${separator} `));
    }
    // Intentionally only react to `value` changes, not `draft` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, separator]);

  return (
    <Input
      value={draft}
      placeholder={placeholder}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        onChange(parse(next, separator));
      }}
      onBlur={() => {
        // Tidy up the visible text without changing the parsed array.
        setDraft(parse(draft, separator).join(`${separator} `));
      }}
    />
  );
}
