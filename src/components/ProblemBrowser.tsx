"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clusters, domainFacets, meta, problems, problemsByCluster, sourceCounts, SOURCE_LABELS } from "@/lib/data";
import {
  applyFilters,
  EMPTY_FILTERS,
  isFiltered,
  LAST_LIST_QUERY_KEY,
  parseFilters,
  serializeFilters,
  toggle,
  type Filters,
} from "@/lib/filters";
import type { ClusterKey, Source } from "@/lib/types";
import { ClusterBadge } from "./ClusterBadge";
import { CheckIcon, ClusterIcon, CloseIcon, SearchIcon } from "./Icons";
import { ProblemCard } from "./ProblemCard";

/* ------------------------------------------------------------------ */
/* URL-connected wrapper                                               */
/* ------------------------------------------------------------------ */

export function ProblemBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(() => parseFilters(params), [params]);

  const setFilters = useCallback(
    (next: Filters) => {
      router.replace(`${pathname}${serializeFilters(next)}`, { scroll: false });
    },
    [router, pathname],
  );

  // Remember the list view so "Back to all problems" on a detail page restores it.
  useEffect(() => {
    try {
      sessionStorage.setItem(LAST_LIST_QUERY_KEY, serializeFilters(filters));
    } catch {
      /* ignore */
    }
  }, [filters]);

  return <BrowserView filters={filters} onChange={setFilters} />;
}

/** Static render used as the Suspense fallback, so exported HTML lists every problem. */
export function ProblemBrowserStatic() {
  return <BrowserView filters={EMPTY_FILTERS} onChange={() => {}} />;
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

function countWith(f: Filters) {
  return applyFilters(f).length;
}

function BrowserView({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const results = useMemo(() => applyFilters(filters), [filters]);
  const filtered = isFiltered(filters);

  // Facet counts reflect every other active filter, so a mentor sees what a click will yield.
  const clusterCounts = useMemo(
    () =>
      Object.fromEntries(clusters.map((c) => [c.key, countWith({ ...filters, clusters: [c.key] })])) as Record<
        ClusterKey,
        number
      >,
    [filters],
  );
  const sourceFacet = useMemo(
    () => ({
      all: countWith({ ...filters, source: null }),
      partner: countWith({ ...filters, source: "partner" }),
      student: countWith({ ...filters, source: "student" }),
    }),
    [filters],
  );
  const domainCounts = useMemo(
    () => Object.fromEntries(domainFacets.map((d) => [d.value, countWith({ ...filters, domains: [d.value] })])),
    [filters],
  );

  const grouped = useMemo(
    () =>
      clusters
        .map((c) => ({ cluster: c, items: results.filter((r) => r.problem.cluster === c.key) }))
        .filter((g) => g.items.length > 0),
    [results],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Intro */}
      <section aria-labelledby="page-title" className="pb-8 pt-10 sm:pt-14">
        <p className="eyebrow">For IEEE mentors</p>
        <h1
          id="page-title"
          className="mt-3 max-w-3xl text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[2.75rem]"
        >
          These are the problem statements
        </h1>
        <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2">
          {problems.length} problem statements in {clusters.length} clusters. Pick your cluster and start exploring.
        </p>
      </section>

      {/* Cluster tiles: the primary filter */}
      <section aria-labelledby="clusters-heading" className="no-print">
        <h2 id="clusters-heading" className="sr-only">
          Filter by cluster
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {clusters.map((c) => {
            const on = filters.clusters.includes(c.key);
            const total = problemsByCluster[c.key].length;
            return (
              <li key={c.key}>
                <button
                  type="button"
                  id={`cluster-${c.key}`}
                  data-cluster={c.key}
                  aria-pressed={on}
                  onClick={() => onChange({ ...filters, clusters: toggle(filters.clusters, c.key) })}
                  className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border p-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
                    on
                      ? "border-(--cl-solid) bg-(--cl-soft) shadow-lift ring-1 ring-(--cl-solid)"
                      : "border-line bg-surface shadow-card hover:border-(--cl-line)"
                  }`}
                >
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-(--cl-solid)" />
                  <span className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-(--cl-ink)">
                      <span className="grid size-8 place-items-center rounded-lg bg-(--cl-soft) ring-1 ring-(--cl-line) transition-transform duration-300 group-hover:rotate-[-6deg]">
                        <ClusterIcon cluster={c.key} className="size-[18px]" />
                      </span>
                      <span className="font-mono text-sm font-bold tracking-wide">{c.key}</span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
                        on ? "bg-ink text-white" : "bg-wash text-ink-2"
                      }`}
                    >
                      {on && <CheckIcon className="size-3" />}
                      {on ? "Selected" : `${total} problems`}
                    </span>
                  </span>
                  <span className="mt-3 block text-[0.9375rem] font-semibold leading-snug text-ink">{c.name}</span>
                  <span className="mt-1 block text-[0.8125rem] leading-relaxed text-muted">{c.blurb}</span>
                  {filtered && !on && clusterCounts[c.key] !== total && (
                    <span className="mt-2 block text-xs font-medium text-ink-2">
                      {clusterCounts[c.key]} match current filters
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Secondary filters */}
      <FilterPanel
        filters={filters}
        onChange={onChange}
        sourceFacet={sourceFacet}
        domainCounts={domainCounts}
      />

      {/* Results */}
      <section aria-labelledby="results-heading" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <h2 id="results-heading" className="text-sm font-semibold text-ink" aria-live="polite" aria-atomic="true">
            {filtered ? (
              <>
                Showing {results.length} of {problems.length} problems
              </>
            ) : (
              <>All {problems.length} problems</>
            )}
          </h2>
          {filtered && <ActiveFilters filters={filters} onChange={onChange} />}
        </div>

        {results.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center animate-fade">
            <p className="text-base font-semibold text-ink">No problems match these filters.</p>
            <p className="mt-1 text-sm text-muted">Remove a filter or try a broader search term.</p>
            <button type="button" id="empty-clear" className="btn-primary mt-5" onClick={() => onChange(EMPTY_FILTERS)}>
              Clear all filters
            </button>
          </div>
        ) : (
          grouped.map(({ cluster, items }) => (
            <section key={cluster.key} aria-labelledby={`group-${cluster.key}`} className="mt-8 first:mt-6">
              <h3 id={`group-${cluster.key}`} className="mb-4 flex flex-wrap items-center gap-3">
                <ClusterBadge cluster={cluster.key} />
                <span className="text-lg font-semibold tracking-[-0.01em] text-ink">{cluster.name}</span>
                <span className="text-sm text-muted">
                  {items.length} {items.length === 1 ? "problem" : "problems"}
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((r, i) => (
                  <ProblemCard key={r.problem.id} problem={r.problem} match={r.match} index={i} />
                ))}
              </div>
            </section>
          ))
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filter panel                                                        */
/* ------------------------------------------------------------------ */

function FilterPanel({
  filters,
  onChange,
  sourceFacet,
  domainCounts,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  sourceFacet: { all: number; partner: number; student: number };
  domainCounts: Record<string, number>;
}) {
  const [q, setQ] = useState(filters.q);
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef(filters);
  latest.current = filters;

  // Follow the URL when it changes from outside (back/forward, clear button).
  useEffect(() => {
    setQ(filters.q);
  }, [filters.q]);

  // Debounce typing into the URL.
  useEffect(() => {
    if (q === latest.current.q) return;
    const t = setTimeout(() => onChange({ ...latest.current, q }), 200);
    return () => clearTimeout(t);
  }, [q, onChange]);

  // "/" focuses search, as on most engineering tools.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !(el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sources: { value: Source | null; label: string; count: number }[] = [
    { value: null, label: "All", count: sourceFacet.all },
    { value: "partner", label: SOURCE_LABELS.partner, count: sourceFacet.partner },
    { value: "student", label: SOURCE_LABELS.student, count: sourceFacet.student },
  ];

  return (
    <section aria-labelledby="filters-heading" className="no-print mt-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <h2 id="filters-heading" className="sr-only">
        Search and filter
      </h2>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label htmlFor="search" className="eyebrow">
            Search
          </label>
          <div className="relative mt-2">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-faint" />
            <input
              ref={inputRef}
              id="search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try a skill, tool or organisation, such as LoRa, FPGA or SELCO"
              autoComplete="off"
              spellCheck={false}
              className="h-11 w-full rounded-xl border border-line-strong bg-canvas/60 pl-10 pr-12 text-[0.9375rem] text-ink placeholder:text-faint transition-[border-color,background-color,box-shadow] focus:border-ink focus:bg-surface focus:shadow-[0_0_0_4px_rgb(21_23_28/0.06)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {q ? (
              <button
                type="button"
                id="search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setQ("");
                  onChange({ ...filters, q: "" });
                  inputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-wash hover:text-ink"
              >
                <CloseIcon />
              </button>
            ) : (
              <kbd
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line-strong bg-surface px-1.5 font-mono text-xs text-muted sm:block"
              >
                /
              </kbd>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted">Searches titles, summaries, skills and the full text of every brief.</p>
        </div>

        <fieldset>
          <legend className="eyebrow">Source</legend>
          <div role="radiogroup" aria-label="Source" className="mt-2 inline-flex flex-wrap gap-1 rounded-xl bg-wash p-1">
            {sources.map((s) => {
              const on = filters.source === s.value;
              return (
                <button
                  key={s.label}
                  type="button"
                  role="radio"
                  id={`source-${s.value ?? "all"}`}
                  aria-checked={on}
                  onClick={() => onChange({ ...filters, source: s.value })}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ${
                    on ? "bg-surface text-ink shadow-card ring-1 ring-line-strong" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {s.label}
                  <span className="tabular-nums text-xs text-muted">{s.count}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <fieldset className="mt-5">
        <legend className="eyebrow">Domain</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {domainFacets.map((d) => {
            const on = filters.domains.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                id={`domain-${d.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                aria-pressed={on}
                onClick={() => onChange({ ...filters, domains: toggle(filters.domains, d.value) })}
                className="chip"
              >
                {on && <CheckIcon className="size-3.5" />}
                {d.value}
                <span className={`tabular-nums text-xs ${on ? "text-white/70" : "text-muted"}`}>
                  {domainCounts[d.value] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
        {meta.note} {sourceCounts.partner} partner, {sourceCounts.student} student.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Active filter summary                                               */
/* ------------------------------------------------------------------ */

function ActiveFilters({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const pills: { key: string; label: string; remove: () => void }[] = [];
  if (filters.q.trim())
    pills.push({ key: "q", label: `"${filters.q.trim()}"`, remove: () => onChange({ ...filters, q: "" }) });
  for (const k of filters.clusters)
    pills.push({
      key: `c-${k}`,
      label: k,
      remove: () => onChange({ ...filters, clusters: filters.clusters.filter((x) => x !== k) }),
    });
  if (filters.source)
    pills.push({ key: "s", label: SOURCE_LABELS[filters.source], remove: () => onChange({ ...filters, source: null }) });
  for (const d of filters.domains)
    pills.push({
      key: `d-${d}`,
      label: d,
      remove: () => onChange({ ...filters, domains: filters.domains.filter((x) => x !== d) }),
    });

  return (
    <div className="flex flex-wrap items-center gap-1.5 animate-fade">
      {pills.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={p.remove}
          aria-label={`Remove filter ${p.label}`}
          className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface py-0.5 pl-2.5 pr-1.5 text-[0.8125rem] font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink"
        >
          {p.label}
          <CloseIcon className="size-3.5" />
        </button>
      ))}
      <button
        type="button"
        id="clear-all"
        onClick={() => onChange(EMPTY_FILTERS)}
        className="ml-1 rounded-md px-2 py-0.5 text-[0.8125rem] font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
      >
        Clear all
      </button>
    </div>
  );
}
