"use client";
import { useState } from "react";
import { CheckIcon, CopyIcon, LinkIcon, PrintIcon } from "./Icons";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for file:// or older browsers.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function CopyButton({
  id,
  label,
  doneLabel = "Copied",
  getText,
  icon = "copy",
  variant = "secondary",
}: {
  id: string;
  label: string;
  doneLabel?: string;
  getText: () => string;
  icon?: "copy" | "link";
  variant?: "secondary" | "ghost" | "primary";
}) {
  const [done, setDone] = useState(false);
  const Icon = icon === "link" ? LinkIcon : CopyIcon;
  return (
    <button
      type="button"
      id={id}
      className={`btn-${variant}`}
      onClick={async () => {
        if (await copyText(getText())) {
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        }
      }}
    >
      {done ? <CheckIcon /> : <Icon />}
      <span aria-live="polite">{done ? doneLabel : label}</span>
    </button>
  );
}

export function CopyLinkButton({ id = "copy-link" }: { id?: string }) {
  return <CopyButton id={id} label="Copy link" doneLabel="Link copied" icon="link" getText={() => window.location.href.split("#")[0] ?? ""} />;
}

export function PrintButton() {
  return (
    <button type="button" id="print" className="btn-ghost" onClick={() => window.print()}>
      <PrintIcon />
      Print
    </button>
  );
}
