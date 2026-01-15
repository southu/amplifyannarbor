"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Heading2,
  Bold,
  Italic,
  List,
  Link,
  Image,
  Code,
  Eye,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (openTag: string, closeTag: string, placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;

    const before = value.substring(0, start);
    const after = value.substring(end);

    const newValue = before + openTag + selectedText + closeTag + after;
    onChange(newValue);

    // Set cursor position after the inserted content
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Heading2,
      label: "Heading",
      action: () => insertTag("<h2>", "</h2>", "Heading"),
    },
    {
      icon: Bold,
      label: "Bold",
      action: () => insertTag("<strong>", "</strong>", "bold text"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertTag("<em>", "</em>", "italic text"),
    },
    {
      icon: List,
      label: "List",
      action: () =>
        insertTag("<ul>\n  <li>", "</li>\n</ul>", "List item"),
    },
    {
      icon: Link,
      label: "Link",
      action: () => insertTag('<a href="">', "</a>", "Link text"),
    },
    {
      icon: Image,
      label: "Image",
      action: () => insertTag('<img src="', '" alt="description" />', "image-url"),
    },
  ];

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-[var(--color-bg-elevated)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 p-2 bg-[var(--color-bg-card)]">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((button) => (
            <button
              key={button.label}
              type="button"
              onClick={button.action}
              className="p-2 rounded hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-white transition-colors"
              title={button.label}
              disabled={isPreview}
            >
              <button.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              !isPreview
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            <Code className="w-4 h-4" />
            HTML
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isPreview
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div
          className="p-4 min-h-[400px] prose prose-invert max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-3
            prose-p:text-[var(--color-text-secondary)] prose-p:leading-relaxed
            prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-em:text-[var(--color-text-secondary)]
            prose-ul:text-[var(--color-text-secondary)] prose-li:marker:text-[var(--color-accent)]"
          dangerouslySetInnerHTML={{ __html: value || "<p>Nothing to preview</p>" }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[400px] p-4 bg-transparent text-white font-mono text-sm resize-y focus:outline-none placeholder:text-[var(--color-text-muted)]"
        />
      )}
    </div>
  );
}
