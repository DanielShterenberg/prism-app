import { v4 as uuidv4 } from "uuid";
import type { Assessment } from "@/types/assessment";

const KEY_PREFIX = "prism:assessment:";

/**
 * Returns true if localStorage is available (e.g. not in Safari private mode).
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__prism_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function buildKey(id: string): string {
  return `${KEY_PREFIX}${id}`;
}

/**
 * Persist a new assessment. Generates id, createdAt, and updatedAt automatically.
 * Returns the saved assessment, or null if localStorage is unavailable.
 */
export function saveAssessment(
  data: Omit<Assessment, "id" | "createdAt" | "updatedAt">
): Assessment | null {
  if (!isLocalStorageAvailable()) return null;

  const now = new Date().toISOString();
  const assessment: Assessment = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  try {
    localStorage.setItem(buildKey(assessment.id), JSON.stringify(assessment));
    return assessment;
  } catch {
    return null;
  }
}

/**
 * Update an existing assessment by id. Updates updatedAt automatically.
 * Returns the updated assessment, or null if not found or localStorage is unavailable.
 */
export function updateAssessment(
  id: string,
  data: Partial<Omit<Assessment, "id" | "createdAt" | "updatedAt">>
): Assessment | null {
  if (!isLocalStorageAvailable()) return null;

  const existing = getAssessment(id);
  if (!existing) return null;

  const updated: Assessment = {
    ...existing,
    ...data,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(buildKey(id), JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

/**
 * Retrieve a single assessment by id.
 * Returns null if not found or localStorage is unavailable.
 */
export function getAssessment(id: string): Assessment | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const raw = localStorage.getItem(buildKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as Assessment;
  } catch {
    return null;
  }
}

/**
 * List all assessments stored locally, sorted by updatedAt descending (most recent first).
 * Returns an empty array if localStorage is unavailable or no assessments exist.
 */
export function listAssessments(): Assessment[] {
  if (!isLocalStorageAvailable()) return [];

  const results: Assessment[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(KEY_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        results.push(JSON.parse(raw) as Assessment);
      } catch {
        // skip malformed entries
      }
    }
  } catch {
    return [];
  }

  return results.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Delete an assessment by id.
 * Returns true if deleted, false if not found or localStorage is unavailable.
 */
export function deleteAssessment(id: string): boolean {
  if (!isLocalStorageAvailable()) return false;

  const key = buildKey(id);
  if (localStorage.getItem(key) === null) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
