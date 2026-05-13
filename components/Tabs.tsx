"use client";

import { cn } from "@/lib/cn";

export type Tab = { id: string; label: string; icon?: React.ComponentType<{ className?: string }> };

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-0 border-b border-rule mb-6">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              isActive
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink hover:border-rule",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
