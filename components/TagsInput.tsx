"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function TagsInput({
  value,
  onChange,
  placeholder = "Add tag and press Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft("");
  };

  const remove = (i: number) => {
    onChange(value.filter((_, j) => j !== i));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && value.length) {
      remove(value.length - 1);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 rounded-md border border-rule bg-white px-2 py-1.5")}>
      {value.map((t, i) => (
        <span key={i} className="inline-flex items-center gap-1 rounded bg-rule/60 px-2 py-0.5 text-xs">
          {t}
          <button type="button" onClick={() => remove(i)} className="hover:text-red-600">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder={value.length ? "" : placeholder}
        className="flex-1 min-w-[120px] bg-transparent px-1 py-1 text-sm outline-none"
      />
    </div>
  );
}
