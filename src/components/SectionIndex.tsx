"use client";
import { useEffect, useState } from "react";

/** "On this page" index with scroll-spy. Lists only sections present in the data. */
export function SectionIndex({ items }: { items: { slug: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.slug ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.slug)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        const first = items.find((i) => visible.get(i.slug));
        if (first) setActive(first.slug);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sections in this brief">
      <p className="eyebrow">On this page</p>
      <ol className="relative mt-3 border-l border-line">
        {items.map((i) => {
          const on = i.slug === active;
          return (
            <li key={i.slug}>
              <a
                href={`#${i.slug}`}
                aria-current={on ? "location" : undefined}
                onClick={() => setActive(i.slug)}
                className={`-ml-px block border-l-2 py-1.5 pl-3.5 text-[0.8125rem] leading-5 transition-[color,border-color] duration-200 ${
                  on ? "border-(--cl-solid) font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {i.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
