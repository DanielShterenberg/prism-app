/**
 * useAssessments — loads all assessments for the home screen.
 *
 * Strategy (offline-first):
 *   1. On mount, reads immediately from localStorage and sets state.
 *   2. In the background, fetches GET /api/assessments from the cloud.
 *   3. For each cloud record that is newer than (or missing from) the local
 *      copy, writes it back to localStorage and triggers a re-render.
 *   4. The final list is always sorted by updatedAt descending.
 *
 * The hook never blocks the user on the network — the local snapshot is
 * always shown first.
 */

import { useState, useEffect, useCallback } from "react";
import {
  listAssessments,
  updateAssessment,
  getAssessment,
} from "@/lib/localStorage";
import type { Assessment } from "@/types/assessment";

export interface UseAssessmentsReturn {
  /** Sorted list of assessments (updatedAt desc). Empty while loading. */
  assessments: Assessment[];
  /** True only during the initial localStorage read. */
  loading: boolean;
  /** Non-null when the cloud reconciliation request fails. */
  cloudError: Error | null;
  /** Whether a background cloud sync is in flight. */
  syncing: boolean;
  /** Reload both sources manually (e.g. after creating a new assessment). */
  refresh: () => void;
}

function sortByUpdatedAt(list: Assessment[]): Assessment[] {
  return [...list].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function useAssessments(authToken?: string): UseAssessmentsReturn {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloudError, setCloudError] = useState<Error | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Load from localStorage synchronously on every refresh
  const loadLocal = useCallback((): Assessment[] => {
    const local = listAssessments(); // already sorted
    setAssessments(local);
    return local;
  }, []);

  // Background cloud reconciliation
  const reconcileCloud = useCallback(async () => {
    setSyncing(true);
    setCloudError(null);

    try {
      const headers: Record<string, string> = {};
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
      const res = await fetch("/api/assessments", { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const cloud: Assessment[] = await res.json();

      // Merge: for each cloud record, write to localStorage if newer or missing
      let didUpdate = false;
      for (const cloudRecord of cloud) {
        const local = getAssessment(cloudRecord.id);
        const cloudTime = new Date(cloudRecord.updatedAt).getTime();
        const localTime = local
          ? new Date(local.updatedAt).getTime()
          : -Infinity;

        if (!local) {
          // Missing locally — write the cloud record directly to localStorage
          // using the canonical key format from lib/localStorage so that
          // listAssessments() will pick it up on the next read.
          try {
            localStorage.setItem(
              `prism:assessment:${cloudRecord.id}`,
              JSON.stringify({ ...cloudRecord, syncStatus: "synced" as const })
            );
            didUpdate = true;
          } catch {
            // ignore storage errors
          }
        } else if (cloudTime > localTime) {
          // Cloud is newer — overwrite local
          updateAssessment(cloudRecord.id, {
            ...cloudRecord,
            syncStatus: "synced",
          });
          didUpdate = true;
        }
      }

      if (didUpdate) {
        setAssessments(sortByUpdatedAt(listAssessments()));
      }
    } catch (err) {
      setCloudError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setSyncing(false);
    }
  }, [authToken]);

  const refresh = useCallback(() => {
    loadLocal();
    reconcileCloud();
  }, [loadLocal, reconcileCloud]);

  // Initial load
  useEffect(() => {
    loadLocal();
    setLoading(false);
    reconcileCloud();
  }, [loadLocal, reconcileCloud]);

  return { assessments, loading, cloudError, syncing, refresh };
}
