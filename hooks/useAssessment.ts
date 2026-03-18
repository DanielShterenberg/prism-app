/**
 * useAssessment — loads a single assessment by id from localStorage.
 *
 * Strategy (offline-first):
 *   1. On mount, reads immediately from localStorage using a lazy useState
 *      initializer — no useEffect, no extra render, no flicker.
 *   2. If the assessment is not found, notFound is true from the first render.
 *   3. refresh() re-reads from localStorage and forces a re-render.
 *
 * The hook never blocks the user on the network.
 */

import { useState, useCallback } from "react";
import { getAssessment } from "@/lib/localStorage";
import type { Assessment } from "@/types/assessment";

export interface UseAssessmentReturn {
  /** The loaded assessment, or null if not found. */
  assessment: Assessment | null;
  /** True when the id was not found in localStorage. */
  notFound: boolean;
  /** Reload from localStorage manually (e.g. after an update). */
  refresh: () => void;
}

/**
 * Reads the assessment synchronously from localStorage.
 * Safe to call in a useState initializer (runs only on the client,
 * the component is "use client" so there is no SSR concern).
 */
function readAssessment(id: string): Assessment | null {
  if (!id) return null;
  try {
    return getAssessment(id);
  } catch {
    return null;
  }
}

export function useAssessment(id: string): UseAssessmentReturn {
  // Lazy initializer: reads localStorage once on first render, no useEffect needed.
  const [assessment, setAssessment] = useState<Assessment | null>(() =>
    readAssessment(id)
  );

  const refresh = useCallback(() => {
    setAssessment(readAssessment(id));
  }, [id]);

  const notFound = !id || assessment === null;

  return { assessment, notFound, refresh };
}
