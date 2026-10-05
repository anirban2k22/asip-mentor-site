"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShortlist } from "@/lib/shortlist";
import { BookmarkIcon } from "./Icons";

export function SiteHeader() {
  const pathname = usePathname();
  const { ids } = useShortlist();
  const onShortlist = pathname?.startsWith("/shortlist");
  const onList = pathname === "/";

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" id="nav-home" className="group flex items-center gap-2.5 rounded-md">
          <span aria-hidden="true" className="grid grid-cols-2 gap-[3px]">
            {(["AI", "SW", "EE", "MECH"] as const).map((k) => (
              <span
                key={k}
                data-cluster={k}
                className="size-[7px] rounded-[2px] bg-(--cl-solid) transition-transform duration-300 group-hover:scale-110"
              />
            ))}
          </span>
          <span className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
            ASIP <span className="font-normal text-muted">Mentor guide</span>
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          <Link
            href="/"
            id="nav-problems"
            aria-current={onList ? "page" : undefined}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-wash hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[6px]"
          >
            All problems
          </Link>
          <Link
            href="/shortlist/"
            id="nav-shortlist"
            aria-current={onShortlist ? "page" : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-wash hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[6px]"
          >
            <BookmarkIcon className="size-4" filled={ids.length > 0} />
            Shortlist
            <span
              className={`min-w-5 rounded-full px-1.5 text-center text-xs font-semibold leading-5 tabular-nums transition-colors ${
                ids.length ? "bg-ink text-white" : "bg-wash text-muted"
              }`}
            >
              <span className="sr-only">, </span>
              {ids.length}
              <span className="sr-only"> problems</span>
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
