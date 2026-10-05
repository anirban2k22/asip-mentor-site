"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LAST_LIST_QUERY_KEY } from "@/lib/filters";
import { ArrowIcon } from "./Icons";

/** Returns to the list with the mentor's last filters intact. */
export function BackToList({ id = "back-to-list", className = "" }: { id?: string; className?: string }) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    try {
      setQuery(sessionStorage.getItem(LAST_LIST_QUERY_KEY) ?? "");
    } catch {
      /* ignore */
    }
  }, []);
  return (
    <Link
      href={`/${query}`}
      id={id}
      className={`inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-ink-2 transition-colors hover:text-ink ${className}`}
    >
      <ArrowIcon dir="left" className="size-4" />
      {query ? "Back to filtered list" : "All problems"}
    </Link>
  );
}
