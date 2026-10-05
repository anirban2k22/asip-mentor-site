import Link from "next/link";
import { SOURCE_LABELS } from "@/lib/data";
import type { MatchKind } from "@/lib/data";
import type { Problem } from "@/lib/types";
import { ClusterBadge } from "./ClusterBadge";
import { ArrowIcon } from "./Icons";
import { ShortlistButton } from "./ShortlistButton";

/**
 * The card is the three-minute unit: everything a mentor needs to decide
 * "could I mentor this?" without opening the brief. The whole card is a link
 * (stretched anchor), with the shortlist toggle layered above it.
 */
export function ProblemCard({ problem: p, match, index = 0 }: { problem: Problem; match?: MatchKind; index?: number }) {
  return (
    <article
      data-cluster={p.cluster}
      aria-labelledby={`card-title-${p.id}`}
      style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
      className="group relative flex animate-rise flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-(--cl-line) hover:shadow-lift focus-within:border-(--cl-line) focus-within:shadow-lift"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-(--cl-solid) opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
      />
      <div className="flex flex-wrap items-center gap-2 text-[0.8125rem]">
        <ClusterBadge cluster={p.cluster} />
        <span className="font-mono font-semibold text-ink">{p.id}</span>
        <span aria-hidden="true" className="text-faint">
          ·
        </span>
        <span className="text-muted">{SOURCE_LABELS[p.source]}</span>
      </div>

      <h3 id={`card-title-${p.id}`} className="mt-3 text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
        <Link
          href={`/problems/${p.id}/`}
          className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ink"
        >
          {p.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted">{p.owner}</p>

      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">{p.summary}</p>

      <div className="mt-4">
        <p className="sr-only">Skills</p>
        <ul className="flex flex-wrap gap-1.5" aria-label="Skills">
          {p.skills.map((s) => (
            <li key={s} className="tag">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <p className="text-[0.8125rem] leading-5 text-muted">
          <span className="sr-only">Domains: </span>
          {p.domains.join(", ")}
          {match === "brief" && <span className="mt-0.5 block font-medium text-ink-2">Matched in full brief</span>}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <ShortlistButton id={p.id} title={p.title} />
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg text-faint transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-(--cl-ink)"
          >
            <ArrowIcon />
          </span>
        </div>
      </div>
    </article>
  );
}
