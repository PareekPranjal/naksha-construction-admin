"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

type Column<T> = {
  key: string;
  label?: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  rowHref: (row: T) => string;
  empty?: React.ReactNode;
};

export function DataTable<T extends { id: string }>({ rows, columns, rowHref, empty }: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-rule bg-white p-8 text-center text-sm text-muted">
        {empty ?? "Nothing here yet."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-rule bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-rule bg-rule/30">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-4 py-3 font-medium text-muted">
                {c.label ?? c.key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className={cn("border-b border-rule last:border-b-0 hover:bg-rule/20", i % 2 && "bg-rule/10")}
            >
              {columns.map((c, ci) => (
                <td key={c.key} className="px-4 py-3 align-top">
                  {ci === 0 ? (
                    <Link href={rowHref(row)} className="text-ink hover:underline">
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                    </Link>
                  ) : c.render ? (
                    c.render(row)
                  ) : (
                    String((row as Record<string, unknown>)[c.key] ?? "")
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
