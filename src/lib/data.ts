/**
 * Data layer. Loads src/data/problems.json once, validates its shape at build
 * time, and builds the derived indexes every screen reads from.
 *
 * Content strings are never modified. The only transformation is lower-casing a
 * private copy of the text for search matching.
 */
import raw from "@/data/problems.json";
import {
  DETAIL_KEYS,
  type Cluster,
  type ClusterKey,
  type DetailKey,
  type Problem,
  type ProblemsFile,
  type Source,
} from "./types";

/* ------------------------------------------------------------------ */
/* Validation: fail the build loudly if the data changes shape.        */
/* ------------------------------------------------------------------ */

function validate(input: unknown): ProblemsFile {
  const errors: string[] = [];
  const file = input as ProblemsFile;

  if (!file || typeof file !== "object") throw new Error("problems.json: not an object");
  if (!Array.isArray(file.clusters)) errors.push("clusters is not an array");
  if (!Array.isArray(file.problems)) errors.push("problems is not an array");
  if (errors.length) throw new Error("problems.json: " + errors.join("; "));

  const clusterKeys = new Set(file.clusters.map((c) => c.key));
  const seen = new Set<string>();
  const detailKeys = new Set<string>(DETAIL_KEYS);

  for (const p of file.problems) {
    const at = `problem ${p.id ?? "(no id)"}`;
    if (!p.id) errors.push(`${at}: missing id`);
    if (seen.has(p.id)) errors.push(`${at}: duplicate id`);
    seen.add(p.id);
    if (!clusterKeys.has(p.cluster)) errors.push(`${at}: unknown cluster "${p.cluster}"`);
    if (p.source !== "partner" && p.source !== "student") errors.push(`${at}: unknown source "${p.source}"`);
    for (const f of ["title", "owner", "summary"] as const) {
      if (typeof p[f] !== "string" || !p[f].trim()) errors.push(`${at}: missing ${f}`);
    }
    if (!Array.isArray(p.domains)) errors.push(`${at}: domains is not an array`);
    if (!Array.isArray(p.skills)) errors.push(`${at}: skills is not an array`);
    for (const k of Object.keys(p.detail ?? {})) {
      if (!detailKeys.has(k)) errors.push(`${at}: unknown detail section "${k}"`);
    }
  }
  if (file.meta && file.meta.total !== file.problems.length) {
    errors.push(`meta.total is ${file.meta.total} but there are ${file.problems.length} problems`);
  }
  if (errors.length) throw new Error("problems.json failed validation:\n  " + errors.join("\n  "));
  return file;
}

const data = validate(raw);

/* ------------------------------------------------------------------ */
/* Base collections                                                    */
/* ------------------------------------------------------------------ */

export const meta = data.meta;
export const clusters: readonly Cluster[] = data.clusters;
export const problems: readonly Problem[] = data.problems;

/* ------------------------------------------------------------------ */
/* Derived indexes                                                     */
/* ------------------------------------------------------------------ */

export const clusterByKey: Readonly<Record<ClusterKey, Cluster>> = Object.fromEntries(
  clusters.map((c) => [c.key, c]),
) as Record<ClusterKey, Cluster>;

export const problemById: ReadonlyMap<string, Problem> = new Map(problems.map((p) => [p.id, p]));

/** Problems per cluster, in file order. Cluster order follows the clusters array. */
export const problemsByCluster: Readonly<Record<ClusterKey, Problem[]>> = Object.fromEntries(
  clusters.map((c) => [c.key, problems.filter((p) => p.cluster === c.key)]),
) as Record<ClusterKey, Problem[]>;

export const sourceCounts: Readonly<Record<Source, number>> = {
  partner: problems.filter((p) => p.source === "partner").length,
  student: problems.filter((p) => p.source === "student").length,
};

export interface FacetValue {
  value: string;
  count: number;
}

/** Every domain tag with its problem count, most common first, then alphabetical. */
export const domainFacets: readonly FacetValue[] = (() => {
  const counts = new Map<string, number>();
  for (const p of problems) for (const d of p.domains) counts.set(d, (counts.get(d) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
})();

/** Reading order: cluster order first, then file order inside each cluster. */
export const readingOrder: readonly Problem[] = clusters.flatMap((c) => problemsByCluster[c.key]);

/** Previous and next problem in the same cluster, for in-cluster browsing on the detail page. */
export function clusterNeighbours(id: string): { prev?: Problem; next?: Problem } {
  const p = problemById.get(id);
  if (!p) return {};
  const list = problemsByCluster[p.cluster];
  const i = list.findIndex((x) => x.id === id);
  return { prev: list[i - 1], next: list[i + 1] };
}

/* ------------------------------------------------------------------ */
/* Search index                                                        */
/* ------------------------------------------------------------------ */

const fold = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

export interface SearchEntry {
  /** Fields shown on the card: id, title, owner, summary, domains, skills, cluster name. */
  card: string;
  /** Full brief text, every detail section joined. */
  brief: string;
}

export const searchIndex: ReadonlyMap<string, SearchEntry> = new Map(
  problems.map((p) => [
    p.id,
    {
      card: fold(
        [p.id, p.title, p.owner, p.summary, clusterByKey[p.cluster].name, ...p.domains, ...p.skills].join("\n"),
      ),
      brief: fold(Object.values(p.detail).join("\n")),
    },
  ]),
);

export type MatchKind = "card" | "brief";

/**
 * Returns where every term of the query matched, or null for no match.
 * "card" means all terms appear in fields a mentor sees on the card.
 * "brief" means at least one term only appears in the full brief text.
 */
export function matchProblem(id: string, query: string): MatchKind | null {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return "card";
  const entry = searchIndex.get(id);
  if (!entry) return null;
  let kind: MatchKind = "card";
  for (const t of terms) {
    if (entry.card.includes(t)) continue;
    if (entry.brief.includes(t)) kind = "brief";
    else return null;
  }
  return kind;
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

/** Interface labels for detail sections. Interface copy, not data. */
export const SECTION_LABELS: Readonly<Record<DetailKey, string>> = {
  whoYouWorkWith: "Who you work with",
  situation: "The situation",
  whatIsGoingWrong: "What is going wrong",
  whyNotFixed: "Why it is not fixed yet",
  whatExists: "What exists already",
  whatYouHave: "What you have",
  doneIn90Days: "Done in 90 days",
  rules: "Rules",
  findingYourApproach: "Finding your approach",
  sponsor: "Sponsor",
  skillsAndBranches: "Skills and branches",
};

/** URL fragment for each section, used by the in-page section index. */
export const SECTION_SLUGS: Readonly<Record<DetailKey, string>> = {
  whoYouWorkWith: "who-you-work-with",
  situation: "situation",
  whatIsGoingWrong: "what-is-going-wrong",
  whyNotFixed: "why-not-fixed",
  whatExists: "what-exists",
  whatYouHave: "what-you-have",
  doneIn90Days: "done-in-90-days",
  rules: "rules",
  findingYourApproach: "finding-your-approach",
  sponsor: "sponsor",
  skillsAndBranches: "skills-and-branches",
};

/**
 * Sections present for a problem, in one fixed order for every record so a
 * mentor always finds "Done in 90 days" in the same place. Missing or blank
 * sections are dropped, never filled.
 */
export function sectionsFor(p: Problem): { key: DetailKey; text: string }[] {
  return DETAIL_KEYS.flatMap((key) => {
    const text = p.detail[key];
    return typeof text === "string" && text.trim() ? [{ key, text }] : [];
  });
}

export const SOURCE_LABELS: Readonly<Record<Source, string>> = {
  partner: "Partner brief",
  student: "Student-raised",
};
