"use client";
/**
 * Mentor shortlist, stored in localStorage only. No backend, no account.
 * Exposed through useSyncExternalStore so every component stays in sync,
 * including across browser tabs (via the storage event).
 */
import { useSyncExternalStore } from "react";
import { problemById, readingOrder } from "./data";

const KEY = "asip:shortlist";
const listeners = new Set<() => void>();
const EMPTY: readonly string[] = Object.freeze([]);

let cache: readonly string[] | null = null;

function read(): readonly string[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    cache = normalise(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []);
  } catch {
    cache = EMPTY;
  }
  return cache;
}

/** Keep only known ids, in reading order, without duplicates. */
export function normalise(ids: readonly string[]): readonly string[] {
  const wanted = new Set(ids.filter((id) => problemById.has(id)));
  return readingOrder.filter((p) => wanted.has(p.id)).map((p) => p.id);
}

function write(ids: readonly string[]) {
  cache = normalise(ids);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage full or blocked: keep the in-memory copy for this session */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useShortlist() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    ids,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => write(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]),
    remove: (id: string) => write(ids.filter((x) => x !== id)),
    addMany: (more: readonly string[]) => write([...ids, ...more]),
    clear: () => write([]),
  };
}
