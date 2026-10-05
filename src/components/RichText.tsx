import { Fragment, type ReactNode } from "react";

/**
 * Renders brief text from problems.json without altering it.
 *
 * Supported, because the data uses it:
 *   - blank-line separated paragraphs; single newlines become line breaks
 *   - "- " bullet lines (runs separated by blank lines merge into one list)
 *   - "1. " numbered lines (same merging, original numbering kept via `start`)
 *   - **bold** and *italic*
 *
 * Anything else, including non-markdown markers such as "•" or "○", is
 * printed exactly as written.
 */

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; start: number; items: string[] };

const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*(\d+)[.)]\s+(.*)$/;

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  const push = (b: Block) => {
    const last = blocks[blocks.length - 1];
    if (b.kind === "ul" && last?.kind === "ul") last.items.push(...b.items);
    else if (b.kind === "ol" && last?.kind === "ol") last.items.push(...b.items);
    else blocks.push(b);
  };

  for (const chunk of text.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").filter((l) => l.trim() !== "");
    let para: string[] = [];
    const flush = () => {
      if (para.length) push({ kind: "p", lines: para });
      para = [];
    };
    for (const line of lines) {
      const b = BULLET.exec(line);
      const n = NUMBERED.exec(line);
      if (b) {
        flush();
        push({ kind: "ul", items: [b[1] ?? ""] });
      } else if (n) {
        flush();
        push({ kind: "ol", start: Number(n[1]), items: [n[2] ?? ""] });
      } else {
        para.push(line.trim());
      }
    }
    flush();
  }
  return blocks;
}

const INLINE = /(\*\*[^*\n]+?\*\*|(?<![\w*])\*(?!\s)[^*\n]+?(?<!\s)\*(?![\w*]))/g;

function inline(text: string): ReactNode {
  const parts = text.split(INLINE);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (i % 2 === 1 && part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ text, className = "prose-brief" }: { text: string; className?: string }) {
  const blocks = parse(text);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.kind === "ul")
          return (
            <ul key={i}>
              {b.items.map((it, j) => (
                <li key={j}>{inline(it)}</li>
              ))}
            </ul>
          );
        if (b.kind === "ol")
          return (
            <ol key={i} start={b.start}>
              {b.items.map((it, j) => (
                <li key={j}>{inline(it)}</li>
              ))}
            </ol>
          );
        return (
          <p key={i}>
            {b.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
