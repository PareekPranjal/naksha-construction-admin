"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Redirect } from "@/lib/types";
import { Button, Card, Field, Input, PageHeader } from "@/components/ui";

export default function RedirectsPage() {
  const [items, setItems] = useState<Redirect[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [code, setCode] = useState("301");

  const reload = () => {
    api
      .get<Redirect[]>("/redirects")
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  };

  useEffect(reload, []);

  const add = async () => {
    setError(null);
    try {
      await api.post("/redirects", { fromPath: from, toPath: to, statusCode: Number(code) });
      setFrom("");
      setTo("");
      reload();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
  };

  const remove = async (id: string) => {
    await api.delete(`/redirects/${id}`);
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Redirects"
        description="301/302 path redirects. Auto-created when a slug or page path is renamed."
      />

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          Add redirect
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_120px_auto] gap-3">
          <Field label="From">
            <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="/old-path" />
          </Field>
          <Field label="To">
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="/new-path" />
          </Field>
          <Field label="Status">
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button onClick={add}>Add</Button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </Card>

      {items.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted">No redirects yet.</Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-rule bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-rule bg-rule/30">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted">From</th>
                <th className="text-left px-4 py-3 font-medium text-muted">To</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-rule last:border-b-0">
                  <td className="px-4 py-2 font-mono text-xs">{r.fromPath}</td>
                  <td className="px-4 py-2 font-mono text-xs">{r.toPath}</td>
                  <td className="px-4 py-2">{r.statusCode}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" onClick={() => remove(r.id)} className="text-red-600">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
