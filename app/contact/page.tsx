"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ContactSubmission } from "@/lib/types";
import { Button, Card, PageHeader } from "@/components/ui";
import { useConfirm } from "@/components/Confirm";

export default function ContactInboxPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const reload = () => {
    api
      .get<ContactSubmission[]>("/contact")
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  };

  useEffect(reload, []);

  const remove = async (id: string) => {
    const sub = items.find((s) => s.id === id);
    const ok = await confirm({
      title: "Delete this submission?",
      message: sub
        ? `From ${sub.name} (${sub.email}). This cannot be undone.`
        : "This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    await api.delete(`/contact/${id}`);
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Contact inbox"
        description={`${items.length} submission${items.length === 1 ? "" : "s"}`}
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {items.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted">No submissions yet.</Card>
      ) : (
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id}>
              <Card className="p-4">
                <button
                  type="button"
                  onClick={() => setOpen(open === c.id ? null : c.id)}
                  className="w-full flex items-baseline justify-between text-left"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {c.name} <span className="text-muted">— {c.email}</span>
                    </p>
                    {c.subject && <p className="text-xs text-muted mt-0.5">{c.subject}</p>}
                  </div>
                  <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleString()}</span>
                </button>
                {open === c.id && (
                  <div className="mt-3 pt-3 border-t border-rule">
                    {c.phone && <p className="text-xs text-muted">Phone: {c.phone}</p>}
                    <p className="mt-2 text-sm whitespace-pre-wrap">{c.message}</p>
                    <div className="mt-3 flex justify-end">
                      <Button variant="ghost" className="text-red-600" onClick={() => remove(c.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
