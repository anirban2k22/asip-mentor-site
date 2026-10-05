import { clusterByKey } from "@/lib/data";
import type { ClusterKey } from "@/lib/types";
import { ClusterIcon } from "./Icons";

/**
 * Cluster marker: colour + icon + text, always together.
 * `variant="short"` shows the key (e.g. "EE") with the full name available to
 * assistive tech and on hover; `variant="full"` shows the full cluster name.
 */
export function ClusterBadge({
  cluster,
  variant = "short",
  className = "",
}: {
  cluster: ClusterKey;
  variant?: "short" | "full";
  className?: string;
}) {
  const c = clusterByKey[cluster];
  return (
    <span
      data-cluster={cluster}
      title={c.name}
      className={`inline-flex items-center gap-1.5 rounded-md border border-(--cl-line) bg-(--cl-soft) px-2 py-0.5 text-[0.8125rem] font-semibold leading-5 text-(--cl-ink) ${className}`}
    >
      <ClusterIcon cluster={cluster} className="size-3.5 shrink-0" />
      {variant === "short" ? (
        <>
          <span aria-hidden="true">{c.key}</span>
          <span className="sr-only">{c.name}</span>
        </>
      ) : (
        <span>{c.name}</span>
      )}
    </span>
  );
}
