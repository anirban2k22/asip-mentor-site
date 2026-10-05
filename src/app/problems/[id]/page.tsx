import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLinkButton, PrintButton } from "@/components/Actions";
import { BackToList } from "@/components/BackToList";
import { ClusterBadge } from "@/components/ClusterBadge";
import { ArrowIcon } from "@/components/Icons";
import { RichText } from "@/components/RichText";
import { SectionIndex } from "@/components/SectionIndex";
import { ShortlistButton } from "@/components/ShortlistButton";
import {
  clusterByKey,
  clusterNeighbours,
  problemById,
  problems,
  problemsByCluster,
  SECTION_LABELS,
  SECTION_SLUGS,
  sectionsFor,
  SOURCE_LABELS,
} from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return problems.map((p) => ({ id: p.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = problemById.get(id);
  if (!p) return {};
  return { title: `${p.id} ${p.title}`, description: p.summary };
}

export default async function ProblemPage({ params }: Props) {
  const { id } = await params;
  const p = problemById.get(id);
  if (!p) notFound();

  const cluster = clusterByKey[p.cluster];
  const sections = sectionsFor(p);
  const index = sections.map((s) => ({ slug: SECTION_SLUGS[s.key], label: SECTION_LABELS[s.key] }));
  const { prev, next } = clusterNeighbours(p.id);
  const position = problemsByCluster[p.cluster].findIndex((x) => x.id === p.id) + 1;
  const clusterTotal = problemsByCluster[p.cluster].length;

  return (
    <div data-cluster={p.cluster}>
      {/* Header band */}
      <div className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,var(--cl-soft)_0%,transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-(--cl-solid)"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="no-print flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <BackToList />
            <span aria-hidden="true" className="text-line-strong">
              /
            </span>
            <Link
              href={`/?cluster=${p.cluster}`}
              id="breadcrumb-cluster"
              className="rounded-md font-medium text-ink-2 transition-colors hover:text-ink"
            >
              {cluster.name}
            </Link>
            <span aria-hidden="true" className="text-line-strong">
              /
            </span>
            <span aria-current="page" className="font-mono font-semibold text-ink">
              {p.id}
            </span>
          </nav>

          <div className="mt-8 flex flex-wrap items-center gap-2.5 text-sm animate-fade">
            <ClusterBadge cluster={p.cluster} variant="full" />
            <span className="font-mono font-semibold text-ink">{p.id}</span>
            <span aria-hidden="true" className="text-faint">
              ·
            </span>
            <span className="text-muted">{SOURCE_LABELS[p.source]}</span>
            <span aria-hidden="true" className="text-faint">
              ·
            </span>
            <span className="text-muted">
              {position} of {clusterTotal} in {p.cluster}
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl text-[2rem] font-semibold leading-[1.12] tracking-[-0.025em] text-ink animate-rise sm:text-[2.6rem]">
            {p.title}
          </h1>
          <p className="mt-2 text-base text-ink-2">{p.owner}</p>
          <p className="mt-5 max-w-3xl font-serif text-[1.25rem] leading-relaxed text-ink">{p.summary}</p>

          <dl className="mt-8 grid max-w-5xl gap-x-10 gap-y-5 sm:grid-cols-[auto_1fr]">
            <dt className="eyebrow pt-1">Skills</dt>
            <dd>
              <ul className="flex flex-wrap gap-1.5">
                {p.skills.map((s) => (
                  <li key={s} className="tag bg-surface ring-1 ring-line">
                    {s}
                  </li>
                ))}
              </ul>
            </dd>
            <dt className="eyebrow pt-0.5">Domains</dt>
            <dd className="text-sm text-ink-2">{p.domains.join(", ")}</dd>
          </dl>

          <div className="no-print mt-8 flex flex-wrap items-center gap-2">
            <ShortlistButton id={p.id} title={p.title} size="md" />
            <CopyLinkButton />
            <PrintButton />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-10 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14 lg:px-8">
        <aside className="no-print hidden lg:block">
          <div className="sticky top-24">
            <SectionIndex items={index} />
          </div>
        </aside>

        <article aria-label={`Full brief for ${p.id}`} className="max-w-[46rem]">
          {sections.map((s, i) => {
            const slug = SECTION_SLUGS[s.key];
            const featured = s.key === "doneIn90Days";
            return (
              <section
                key={s.key}
                id={slug}
                aria-labelledby={`${slug}-h`}
                className={
                  featured
                    ? "my-10 rounded-2xl border border-(--cl-line) bg-(--cl-soft) p-6 first:mt-0 sm:p-7"
                    : `py-8 first:pt-0 ${i > 0 && sections[i - 1]?.key !== "doneIn90Days" ? "border-t border-line" : ""}`
                }
              >
                <h2
                  id={`${slug}-h`}
                  className="group flex items-baseline gap-2 text-[1.1875rem] font-semibold tracking-[-0.01em] text-ink"
                >
                  {SECTION_LABELS[s.key]}
                  <a
                    href={`#${slug}`}
                    aria-label={`Link to ${SECTION_LABELS[s.key]}`}
                    className="no-print text-base font-normal text-faint opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    #
                  </a>
                </h2>
                <RichText text={s.text} className="prose-brief mt-3" />
              </section>
            );
          })}
        </article>
      </div>

      {/* Cluster navigation */}
      <nav
        aria-label={`More in ${cluster.name}`}
        className="no-print mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <NeighbourLink id={prev.id} title={prev.title} dir="prev" />
          ) : (
            <span className="hidden sm:block" />
          )}
          {next ? <NeighbourLink id={next.id} title={next.title} dir="next" /> : null}
        </div>
      </nav>
    </div>
  );
}

function NeighbourLink({ id, title, dir }: { id: string; title: string; dir: "prev" | "next" }) {
  return (
    <Link
      href={`/problems/${id}/`}
      id={`${dir}-problem`}
      className={`group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-(--cl-line) hover:shadow-lift ${
        dir === "next" ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
        {dir === "prev" && <ArrowIcon dir="left" className="size-3.5 transition-transform group-hover:-translate-x-0.5" />}
        {dir === "prev" ? "Previous in cluster" : "Next in cluster"}
        {dir === "next" && <ArrowIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />}
      </span>
      <span className="mt-2 text-[0.9375rem] font-semibold text-ink">
        <span className="font-mono">{id}</span> {title}
      </span>
    </Link>
  );
}
