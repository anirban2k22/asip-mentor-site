import type { ClusterKey } from "@/lib/types";

type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

/** One distinct shape per cluster, so cluster is never signalled by colour alone. */
export function ClusterIcon({ cluster, className = "size-4" }: { cluster: ClusterKey } & IconProps) {
  switch (cluster) {
    case "AI": // connected nodes
      return (
        <svg viewBox="0 0 24 24" className={className} {...base}>
          <circle cx="5" cy="6" r="2.25" />
          <circle cx="19" cy="6" r="2.25" />
          <circle cx="12" cy="18" r="2.25" />
          <path d="M7 7.2 10.6 16M17 7.2 13.4 16M7.25 6h9.5" />
        </svg>
      );
    case "SW": // window with code brackets
      return (
        <svg viewBox="0 0 24 24" className={className} {...base}>
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <path d="M3 8.5h18M10 12.5l-2 2 2 2M14 12.5l2 2-2 2" />
        </svg>
      );
    case "EE": // chip
      return (
        <svg viewBox="0 0 24 24" className={className} {...base}>
          <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
          <path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21" />
        </svg>
      );
    case "MECH": // gear
      return (
        <svg viewBox="0 0 24 24" className={className} {...base}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23 5.46 5.46" />
          <circle cx="12" cy="12" r="6.25" />
        </svg>
      );
  }
}

export function SearchIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function BookmarkIcon({ className = "size-4", filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} fill={filled ? "currentColor" : "none"}>
      <path d="M6.5 3.75h11a.75.75 0 0 1 .75.75v16l-6.25-4-6.25 4v-16a.75.75 0 0 1 .75-.75Z" />
    </svg>
  );
}

export function ArrowIcon({ className = "size-4", dir = "right" }: IconProps & { dir?: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      {dir === "right" ? <path d="M5 12h14M13 6l6 6-6 6" /> : <path d="M19 12H5M11 6l-6 6 6 6" />}
    </svg>
  );
}

export function ChevronIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CloseIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function CheckIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function LinkIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M10 14a4.5 4.5 0 0 0 6.36 0l3-3a4.5 4.5 0 0 0-6.36-6.36l-1 1" />
      <path d="M14 10a4.5 4.5 0 0 0-6.36 0l-3 3a4.5 4.5 0 0 0 6.36 6.36l1-1" />
    </svg>
  );
}

export function CopyIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2" />
      <path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" />
    </svg>
  );
}

export function PrintIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="14" width="10" height="6" rx="1" />
    </svg>
  );
}
