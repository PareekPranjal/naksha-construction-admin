"use client";

import { KeywordsInput } from "./KeywordsInput";

// Thin wrapper around KeywordsInput with a placeholder hint specific to the
// secondary / LSI keyword role. Parsing, draft-state, and blur-tidy behaviour
// all come from KeywordsInput unchanged.

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

export function SecondaryKeywordsInput({ value, onChange }: Props) {
  return (
    <KeywordsInput
      value={value}
      onChange={onChange}
      placeholder="Supporting keywords (3–5 recommended), comma-separated"
    />
  );
}
