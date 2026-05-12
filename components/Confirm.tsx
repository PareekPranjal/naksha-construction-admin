"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui";
import { Input } from "./ui";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  // When set, the user must type this exact string to enable the confirm button.
  typeToConfirm?: string;
  typeToConfirmLabel?: string;
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

const ConfirmCtx = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [typed, setTyped] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setTyped("");
      setPending({ ...opts, resolve });
    });
  }, []);

  const close = useCallback(
    (ok: boolean) => {
      if (!pending) return;
      pending.resolve(ok);
      setPending(null);
      setTyped("");
    },
    [pending],
  );

  useEffect(() => {
    if (!pending) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, close]);

  const required = pending?.typeToConfirm ?? "";
  const typedMatches = required === "" || typed === required;

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => close(false)}
          />
          <div className="relative w-full max-w-md rounded-lg border border-rule bg-white shadow-xl">
            <div className="flex items-start gap-3 p-5">
              <div
                className={
                  pending.variant === "primary"
                    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rule/40 text-ink"
                    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"
                }
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="confirm-title" className="text-base font-semibold">
                  {pending.title}
                </h3>
                {pending.message && (
                  <p className="mt-1.5 text-sm text-muted">{pending.message}</p>
                )}
                {required && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium mb-1.5">
                      {pending.typeToConfirmLabel ?? (
                        <>
                          To confirm, type{" "}
                          <code className="font-mono text-[12px] bg-rule/40 px-1 py-0.5 rounded">
                            {required}
                          </code>
                        </>
                      )}
                    </label>
                    <Input
                      autoFocus
                      value={typed}
                      onChange={(e) => setTyped(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && typedMatches) close(true);
                      }}
                      placeholder={required}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-rule bg-rule/10 px-5 py-3">
              <Button
                ref={cancelRef}
                variant="secondary"
                type="button"
                onClick={() => close(false)}
              >
                {pending.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                variant={pending.variant ?? "danger"}
                type="button"
                onClick={() => close(true)}
                disabled={!typedMatches}
              >
                {pending.confirmLabel ?? "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ctx;
}
