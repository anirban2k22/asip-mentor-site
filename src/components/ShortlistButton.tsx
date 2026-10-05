"use client";
import { useShortlist } from "@/lib/shortlist";
import { BookmarkIcon } from "./Icons";

export function ShortlistButton({
  id,
  title,
  size = "sm",
}: {
  id: string;
  title: string;
  size?: "sm" | "md";
}) {
  const { has, toggle } = useShortlist();
  const on = has(id);
  const pad = size === "md" ? "px-3.5 py-2 text-sm" : "px-2.5 py-1.5 text-[0.8125rem]";
  return (
    <button
      type="button"
      id={`shortlist-${id}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${id} ${title} from shortlist` : `Add ${id} ${title} to shortlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={`relative z-10 inline-flex items-center gap-1.5 rounded-lg border font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-95 ${pad} ${
        on
          ? "border-ink bg-ink text-white hover:bg-ink-2"
          : "border-line-strong bg-surface text-ink-2 hover:border-ink hover:text-ink"
      }`}
    >
      <BookmarkIcon filled={on} className="size-4 shrink-0" />
      <span>{on ? "Shortlisted" : "Shortlist"}</span>
    </button>
  );
}
