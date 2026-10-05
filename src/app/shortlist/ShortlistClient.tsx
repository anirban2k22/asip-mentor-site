"use client";
import Link from "next/link";
import { useShortlist } from "@/lib/shortlist";
import { problemById } from "@/lib/data";
import { ProblemCard } from "@/components/ProblemCard";
import { BookmarkIcon, CopyIcon, PrintIcon } from "@/components/Icons";

export function ShortlistClient() {
  const { ids, clear } = useShortlist();
  const problems = ids.map((id) => problemById.get(id)).filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="flex items-center gap-2.5 text-[2rem] font-semibold tracking-[-0.025em] text-ink sm:text-[2.5rem]">
            <BookmarkIcon className="size-8" filled />
            Shortlist
          </h1>
          <p className="mt-3 text-base text-ink-2">
            {problems.length} {problems.length === 1 ? "problem" : "problems"} saved to your device.
          </p>
        </div>
        {problems.length > 0 && (
          <div className="no-print flex gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                if (window.confirm("Clear your entire shortlist?")) clear();
              }}
            >
              Clear list
            </button>
            <button type="button" className="btn-secondary" onClick={() => window.print()}>
              <PrintIcon />
              Print
            </button>
          </div>
        )}
      </div>

      {problems.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface py-20 text-center">
          <BookmarkIcon className="size-12 text-line-strong" />
          <h2 className="mt-5 text-lg font-semibold text-ink">Your shortlist is empty</h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            As you browse problem statements, click Shortlist to save them here. Your list is stored securely on your
            device and is not shared.
          </p>
          <Link href="/" className="btn-primary mt-6">
            Browse all problems
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {problems.map((p, i) => (
            <ProblemCard key={p.id} problem={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
