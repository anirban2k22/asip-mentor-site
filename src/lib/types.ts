/**
 * Types for src/data/problems.json.
 *
 * These mirror the file exactly. Nothing here adds, renames or reshapes content.
 * Every detail section is optional, because four records are missing one or more
 * sections and the UI must omit a missing section rather than print a placeholder.
 */

export type ClusterKey = "AI" | "SW" | "EE" | "MECH";
export type Source = "partner" | "student";

export interface Cluster {
  key: ClusterKey;
  name: string;
  blurb: string;
}

export const DETAIL_KEYS = [
  "whoYouWorkWith",
  "situation",
  "whatIsGoingWrong",
  "whyNotFixed",
  "whatExists",
  "whatYouHave",
  "doneIn90Days",
  "rules",
  "findingYourApproach",
  "sponsor",
  "skillsAndBranches",
] as const;

export type DetailKey = (typeof DETAIL_KEYS)[number];
export type ProblemDetail = Partial<Record<DetailKey, string>>;

export interface Problem {
  id: string;
  source: Source;
  cluster: ClusterKey;
  title: string;
  owner: string;
  domains: string[];
  summary: string;
  skills: string[];
  detail: ProblemDetail;
}

export interface ProblemsMeta {
  total: number;
  generated: string;
  note: string;
}

export interface ProblemsFile {
  meta: ProblemsMeta;
  clusters: Cluster[];
  problems: Problem[];
}
