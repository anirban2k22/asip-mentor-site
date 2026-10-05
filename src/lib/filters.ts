/**
 * Filter state <-> URL query string.
 *
 * URL format (all parameters optional, defaults are omitted):
 *   ?q=solar&cluster=EE&cluster=MECH&source=partner&domain=Agriculture
 *
 * - `cluster` and `domain` repeat for multiple values (values may contain spaces
 *   and colons, so repetition is safer than a delimiter).
 * - Unknown values are dropped on parse, so a stale or hand-edited link never
 *   breaks the page.
 * - Serialisation is canonical (fixed parameter order, values in data order), so
 *   the same filter state always produces the same URL.
 *
 * Matching: OR within a facet, AND across facets. Search terms are ANDed.
 */
import {
  clusters,
  domainFacets,
  matchProblem,
  readingOrder,
  type MatchKind,
} from "./data";
import type { ClusterKey, Problem, Source } from "./types";

export interface Filters {
  q: string;
  clusters: ClusterKey[];
  source: Source | null;
  domains: string[];
}

export const EMPTY_FILTERS: Filters = { q: "", clusters: [], source: null, domains: [] };

const CLUSTER_ORDER = clusters.map((c) => c.key);
const DOMAIN_ORDER = domainFacets.map((d) => d.value);

type ParamsLike = Pick<URLSearchParams, "get" | "getAll">;

export function parseFilters(params: ParamsLike): Filters {
  const wantedClusters = new Set(params.getAll("cluster"));
  const wantedDomains = new Set(params.getAll("domain"));
  const source = params.get("source");
  return {
    q: (params.get("q") ?? "").slice(0, 200),
    clusters: CLUSTER_ORDER.filter((k) => wantedClusters.has(k)),
    source: source === "partner" || source === "student" ? source : null,
    domains: DOMAIN_ORDER.filter((d) => wantedDomains.has(d)),
  };
}

export function serializeFilters(f: Filters): string {
  const sp = new URLSearchParams();
  if (f.q.trim()) sp.set("q", f.q);
  for (const k of CLUSTER_ORDER) if (f.clusters.includes(k)) sp.append("cluster", k);
  if (f.source) sp.set("source", f.source);
  for (const d of DOMAIN_ORDER) if (f.domains.includes(d)) sp.append("domain", d);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function isFiltered(f: Filters): boolean {
  return Boolean(f.q.trim() || f.clusters.length || f.source || f.domains.length);
}

export interface FilterResult {
  problem: Problem;
  match: MatchKind;
}

export function applyFilters(f: Filters): FilterResult[] {
  const out: FilterResult[] = [];
  for (const p of readingOrder) {
    if (f.clusters.length && !f.clusters.includes(p.cluster)) continue;
    if (f.source && p.source !== f.source) continue;
    if (f.domains.length && !p.domains.some((d) => f.domains.includes(d))) continue;
    const match = matchProblem(p.id, f.q);
    if (!match) continue;
    out.push({ problem: p, match });
  }
  return out;
}

export function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Session key holding the last list query, so "Back to problems" restores filters. */
export const LAST_LIST_QUERY_KEY = "asip:lastListQuery";
