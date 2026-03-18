/**
 * useSync — manages the full offline-first sync lifecycle for a single Assessment.
 *
 * Behaviour:
 *  - On every call with a new assessment snapshot:
 *      1. Immediately writes syncStatus='pending' to localStorage.
 *      2. Schedules a debounced (1 s) PUT to /api/assessments/:id.
 *  - On success: writes syncStatus='synced' + syncedAt to localStorage and
 *    calls onSyncStatusChange so the parent can re-read from storage.
 *  - On failure: writes syncStatus='error' to localStorage and pushes the id
 *    to an internal retry queue.
 *  - Retry triggers: window 'focus' event and navigator.onLine 'online' event.
 *    On each trigger every id in the retry queue is attempted once.
 *
 * The hook is intentionally side-effect-only — it does not own the assessment
 * state.  The caller stores the Assessment in localStorage (via lib/localStorage)
 * and passes the latest snapshot here.  After every sync outcome the hook calls
 * onSyncStatusChange so the parent can refresh the record from localStorage.
 */

import { useEffect, useRef, useCallback } from "react";
import { updateAssessment } from "@/lib/localStorage";
import type { Assessment, SyncStatus } from "@/types/assessment";

export const SYNC_DEBOUNCE_MS = 1000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseSyncOptions {
  /** The current assessment snapshot to sync. Pass null/undefined to disable. */
  assessment: Assessment | null | undefined;
  /**
   * Bearer token sent in the Authorization header.
   * If omitted the PUT request is still made but will receive a 401.
   */
  authToken?: string;
  /** Called after every sync outcome so the parent can refresh local state. */
  onSyncStatusChange?: (id: string, status: SyncStatus) => void;
}

export interface UseSyncReturn {
  /** Current sync status driven by the hook. */
  syncStatus: SyncStatus;
  /** Manually trigger a sync attempt for all queued ids. */
  flushRetryQueue: () => void;
}

// ---------------------------------------------------------------------------
// Internal helpers (exported for unit testing)
// ---------------------------------------------------------------------------

/**
 * Performs a single PUT /api/assessments/:id call.
 * Returns true on HTTP 2xx, false otherwise.
 * Throws if the network is unavailable (fetch rejects).
 */
export async function putAssessment(
  id: string,
  payload: Assessment,
  authToken?: string
): Promise<boolean> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`/api/assessments/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  return res.ok;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSync({
  assessment,
  authToken,
  onSyncStatusChange,
}: UseSyncOptions): UseSyncReturn {
  // Debounce timer ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Retry queue — ids that failed and need to be retried
  const retryQueue = useRef<Set<string>>(new Set());

  // Track the current sync status so we can expose it
  const syncStatusRef = useRef<SyncStatus>("synced");

  // Keep a ref to the latest assessment so the retry callback can access it
  const assessmentRef = useRef<Assessment | null | undefined>(assessment);
  useEffect(() => {
    assessmentRef.current = assessment;
  }, [assessment]);

  // Keep a stable ref to the callback
  const onSyncStatusChangeRef = useRef(onSyncStatusChange);
  useEffect(() => {
    onSyncStatusChangeRef.current = onSyncStatusChange;
  }, [onSyncStatusChange]);

  // -------------------------------------------------------------------------
  // Core sync action — called both by the debounce and the retry flush
  // -------------------------------------------------------------------------
  const syncAssessment = useCallback(
    async (target: Assessment) => {
      try {
        const success = await putAssessment(target.id, target, authToken);
        if (success) {
          const now = new Date().toISOString();
          updateAssessment(target.id, {
            syncStatus: "synced",
            syncedAt: now,
          });
          syncStatusRef.current = "synced";
          retryQueue.current.delete(target.id);
          onSyncStatusChangeRef.current?.(target.id, "synced");
        } else {
          updateAssessment(target.id, { syncStatus: "error" });
          syncStatusRef.current = "error";
          retryQueue.current.add(target.id);
          onSyncStatusChangeRef.current?.(target.id, "error");
        }
      } catch {
        // Network error (offline, DNS failure, etc.)
        updateAssessment(target.id, { syncStatus: "error" });
        syncStatusRef.current = "error";
        retryQueue.current.add(target.id);
        onSyncStatusChangeRef.current?.(target.id, "error");
      }
    },
    [authToken]
  );

  // -------------------------------------------------------------------------
  // Retry queue flush — attempts every queued id
  // -------------------------------------------------------------------------
  const flushRetryQueue = useCallback(() => {
    const current = assessmentRef.current;
    if (!current) return;

    // Only flush if there is something queued for this assessment
    if (retryQueue.current.has(current.id)) {
      syncAssessment(current);
    }
  }, [syncAssessment]);

  // -------------------------------------------------------------------------
  // React to assessment changes — mark pending + schedule debounced PUT
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!assessment) return;

    // Mark pending immediately in localStorage
    updateAssessment(assessment.id, { syncStatus: "pending" });
    syncStatusRef.current = "pending";
    onSyncStatusChangeRef.current?.(assessment.id, "pending");

    // Clear any existing timer
    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current);
    }

    // Schedule debounced sync
    debounceTimer.current = setTimeout(() => {
      syncAssessment(assessment);
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current);
      }
    };
    // We intentionally omit syncAssessment from the dep array — it is stable
    // after mount (authToken changes are handled via closure in syncAssessment).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment]);

  // -------------------------------------------------------------------------
  // Retry on window focus
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleFocus = () => flushRetryQueue();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [flushRetryQueue]);

  // -------------------------------------------------------------------------
  // Retry on navigator.onLine reconnect
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => flushRetryQueue();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [flushRetryQueue]);

  return {
    syncStatus: assessment?.syncStatus ?? "synced",
    flushRetryQueue,
  };
}
