"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import { InternalLinkPicker } from "./InternalLinkPicker";
import { buildInternalUrl, type InternalDocRef, type InternalDocType } from "@/lib/internalUrl";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type Props = {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

const FONTS = ["sans-serif", "serif", "monospace", "inter", "georgia", "courier"];

const TOOLBAR = [
  [
    { header: [false, 1, 2, 3, 4, 5, 6] },
    "bold",
    "italic",
    "underline",
    "strike",
    { font: FONTS },
    { color: [] },
    { background: [] },
  ],
  [
    { list: "ordered" },
    { list: "bullet" },
    { align: [] },
    { indent: "-1" },
    { indent: "+1" },
  ],
  [
    "link",
    "internalLink",
    "image",
    "video",
    "blockquote",
    "code-block",
    { script: "sub" },
    { script: "super" },
    "clean",
  ],
];

export function RichTextEditor({ id, value, onChange, placeholder, minHeight = 200 }: Props) {
  const quillRef = useRef<unknown>(null);
  const [picker, setPicker] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = (await import("react-quill-new")) as unknown as {
        Quill?: { import: (k: string) => unknown; register: (a: unknown, b?: boolean) => void };
        default?: { Quill?: { import: (k: string) => unknown; register: (a: unknown, b?: boolean) => void } };
      };
      if (cancelled) return;
      const Quill = mod.Quill ?? mod.default?.Quill;
      if (!Quill) return;
      try {
        const Font = Quill.import("formats/font") as { whitelist: string[] };
        Font.whitelist = FONTS;
        Quill.register(Font, true);
      } catch {
        // ignore — already registered
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = document.querySelector(`[data-rte-id="${id ?? "rte"}"] .ql-internalLink`);
    if (!el) return;
    el.innerHTML =
      '<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M7 11 11 7M6.5 13.5a3.5 3.5 0 0 1 0-5l2-2M11.5 4.5a3.5 3.5 0 0 1 0 5l-2 2"/><circle class="ql-fill" cx="14" cy="4" r="1.5"/></svg>';
    (el as HTMLElement).title = "Insert internal link";
  });

  const modules = useMemo(
    () => ({
      toolbar: {
        container: TOOLBAR,
        handlers: {
          internalLink: () => setPicker(true),
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [],
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "font",
      "color",
      "background",
      "list",
      "align",
      "indent",
      "link",
      "image",
      "video",
      "blockquote",
      "code-block",
      "script",
    ],
    [],
  );

  useEffect(() => {
    // Strip inline styles / classes / Word change-tracking spans on paste.
    const qr = quillRef.current as { getEditor?: () => unknown } | null;
    if (!qr?.getEditor) return;
    const editor = qr.getEditor() as {
      clipboard: {
        addMatcher: (selector: string | number, fn: (node: Node, delta: unknown) => unknown) => void;
      };
    };
    const cleanNode = (node: Node) => {
      if (node.nodeType === 1) {
        const el = node as Element;
        el.removeAttribute("style");
        el.removeAttribute("class");
        el.removeAttribute("lang");
        // strip Word tracked-change attributes
        for (const attr of Array.from(el.attributes)) {
          if (attr.name.startsWith("data-") && attr.name !== "data-internal" && attr.name !== "data-doc-id" && attr.name !== "data-doc-type") {
            el.removeAttribute(attr.name);
          }
          if (attr.name.startsWith("aria-")) el.removeAttribute(attr.name);
        }
      }
    };
    editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      cleanNode(node);
      return delta;
    });
  }, []);

  const insertInternalLink = (doc: InternalDocRef) => {
    setPicker(false);
    const qr = quillRef.current as {
      getEditor?: () => {
        getSelection: () => { index: number; length: number } | null;
        getText: (i: number, n: number) => string;
        insertText: (i: number, t: string, fmt?: Record<string, unknown>) => void;
        formatText: (i: number, n: number, fmt: Record<string, unknown>) => void;
        clipboard: { dangerouslyPasteHTML: (i: number, html: string) => void };
        setSelection: (i: number, n: number) => void;
      };
    } | null;
    if (!qr?.getEditor) return;
    const editor = qr.getEditor();
    const range = editor.getSelection();
    const url = doc.url || buildInternalUrl(doc.type as InternalDocType, doc.slug);
    const html = `<a href="${url}" data-internal="true" data-doc-id="${doc.id}" data-doc-type="${doc.type}">${escapeHtml(
      range && range.length > 0 ? editor.getText(range.index, range.length) : doc.title || doc.slug,
    )}</a>`;
    const insertAt = range ? range.index : 0;
    if (range && range.length > 0) {
      // replace selection
      const selectedText = editor.getText(range.index, range.length);
      editor.clipboard.dangerouslyPasteHTML(range.index, html);
      // Quill paste leaves selection at end; move past inserted text
      editor.setSelection(range.index + selectedText.length, 0);
    } else {
      editor.clipboard.dangerouslyPasteHTML(insertAt, html);
      editor.setSelection(insertAt + (doc.title || doc.slug).length, 0);
    }
  };

  return (
    <div data-rte-id={id ?? "rte"} className="rich-text-editor">
      <ReactQuill
        // @ts-expect-error react-quill-new types
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <p className="mt-2 text-xs text-red-600">
        NOTE: Don&apos;t copy content directly from word file or any website. Please copy in notepad and then paste.
      </p>
      {picker && (
        <InternalLinkPicker onSelect={insertInternalLink} onClose={() => setPicker(false)} />
      )}
      <style jsx>{`
        .rich-text-editor :global(.ql-toolbar) {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #fff;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
        }
        .rich-text-editor :global(.ql-container) {
          min-height: ${minHeight}px;
          font-size: 14px;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        }
        .rich-text-editor :global(.ql-editor) {
          min-height: ${minHeight}px;
          max-height: 60vh;
          overflow-y: auto;
        }
        .rich-text-editor :global(.ql-internalLink) {
          width: 28px;
        }
      `}</style>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
