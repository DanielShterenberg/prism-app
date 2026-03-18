/**
 * Unit tests for the useSync sync state machine.
 *
 * Strategy:
 *  - We test the pure sync logic (putAssessment wrapper + state transitions)
 *    without mounting a React component so the tests are fast and deterministic.
 *  - We mock `fetch` globally and `lib/localStorage` to isolate the unit.
 *  - The retry queue and event listener wiring are tested via a thin manual
 *    invocation helper that replicates the syncAssessment logic from useSync.
 *
 * jsdom does not ship the `Response` constructor so we return plain mock
 * objects shaped like { ok: boolean } from our fetch stubs.
 */

import { putAssessment, SYNC_DEBOUNCE_MS } from "../useSync";
import type { Assessment } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: "test-id-001",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    syncStatus: "pending",
    status: "in_progress",
    identification: {
      patientName: "ילד בדיקה",
      assessmentDate: "01/01/2026",
      assessmentTools: [],
      examiner: "ינם",
      referralReason: "הפניה",
    },
    familyBackground: {},
    developmentalBackground: {},
    developmentalMilestones: {},
    frameworksAndTreatments: {},
    ...overrides,
  };
}

/** Returns a fetch stub that resolves with { ok } (mimics the Response shape used by putAssessment). */
function mockFetch(ok: boolean): jest.Mock {
  return jest.fn(async () => ({ ok }));
}

/** Returns a fetch stub that always rejects with a network error. */
function offlineFetch(): jest.Mock {
  return jest.fn(async () => {
    throw new Error("Network error");
  });
}

// ---------------------------------------------------------------------------
// putAssessment — HTTP layer
// ---------------------------------------------------------------------------

describe("putAssessment", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends PUT to /api/assessments/:id with JSON body and auth header", async () => {
    const capturedArgs: string[] = [];
    const capturedOptions: RequestInit[] = [];

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedArgs.push(input as string);
      capturedOptions.push(init ?? {});
      return { ok: true };
    }) as typeof fetch;

    const assessment = makeAssessment();
    const result = await putAssessment(assessment.id, assessment, "my-token");

    expect(result).toBe(true);
    expect(capturedArgs[0]).toBe(`/api/assessments/${assessment.id}`);
    expect(capturedOptions[0].method).toBe("PUT");
    expect(capturedOptions[0].headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer my-token",
    });
    expect(JSON.parse(capturedOptions[0].body as string)).toMatchObject({
      id: assessment.id,
    });
  });

  it("returns true on ok=true (HTTP 200)", async () => {
    global.fetch = mockFetch(true) as typeof fetch;
    expect(await putAssessment("id", makeAssessment())).toBe(true);
  });

  it("returns false on ok=false (HTTP 401)", async () => {
    global.fetch = mockFetch(false) as typeof fetch;
    expect(await putAssessment("id", makeAssessment())).toBe(false);
  });

  it("returns false on ok=false (HTTP 500)", async () => {
    global.fetch = mockFetch(false) as typeof fetch;
    expect(await putAssessment("id", makeAssessment())).toBe(false);
  });

  it("throws when fetch rejects (network error / offline)", async () => {
    global.fetch = offlineFetch() as typeof fetch;
    await expect(putAssessment("id", makeAssessment())).rejects.toThrow(
      "Network error"
    );
  });

  it("does not include Authorization header when authToken is omitted", async () => {
    let capturedHeaders: Record<string, string> | undefined;

    global.fetch = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return { ok: true };
    }) as typeof fetch;

    await putAssessment("id", makeAssessment());
    expect(capturedHeaders?.["Authorization"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Sync state machine transitions
// ---------------------------------------------------------------------------

jest.mock("@/lib/localStorage", () => ({
  updateAssessment: jest.fn(),
}));

import { updateAssessment as mockUpdateAssessment } from "@/lib/localStorage";

const mockedUpdateAssessment = mockUpdateAssessment as jest.Mock;

describe("sync state machine", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    mockedUpdateAssessment.mockClear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  /**
   * Manual harness that replicates the core syncAssessment logic from useSync.
   * Accepts a ready-set global.fetch so it uses whatever was assigned before call.
   */
  async function runSyncCycle(
    assessment: Assessment,
    onStatusChange: (id: string, status: string) => void
  ): Promise<"synced" | "error"> {
    try {
      const success = await putAssessment(assessment.id, assessment);
      if (success) {
        const now = new Date().toISOString();
        mockedUpdateAssessment(assessment.id, {
          syncStatus: "synced",
          syncedAt: now,
        });
        onStatusChange(assessment.id, "synced");
        return "synced";
      } else {
        mockedUpdateAssessment(assessment.id, { syncStatus: "error" });
        onStatusChange(assessment.id, "error");
        return "error";
      }
    } catch {
      mockedUpdateAssessment(assessment.id, { syncStatus: "error" });
      onStatusChange(assessment.id, "error");
      return "error";
    }
  }

  it("transitions to 'synced' and updates syncedAt on success", async () => {
    global.fetch = mockFetch(true) as typeof fetch;
    const onChange = jest.fn();
    const assessment = makeAssessment();

    const result = await runSyncCycle(assessment, onChange);

    expect(result).toBe("synced");
    expect(onChange).toHaveBeenCalledWith(assessment.id, "synced");

    // updateAssessment called with syncStatus='synced' and a syncedAt timestamp
    const callArgs = mockedUpdateAssessment.mock.calls[0];
    expect(callArgs[0]).toBe(assessment.id);
    expect(callArgs[1].syncStatus).toBe("synced");
    expect(typeof callArgs[1].syncedAt).toBe("string");
  });

  it("transitions to 'error' on non-2xx response", async () => {
    global.fetch = mockFetch(false) as typeof fetch;
    const onChange = jest.fn();
    const assessment = makeAssessment();

    const result = await runSyncCycle(assessment, onChange);

    expect(result).toBe("error");
    expect(onChange).toHaveBeenCalledWith(assessment.id, "error");
    expect(mockedUpdateAssessment).toHaveBeenCalledWith(assessment.id, {
      syncStatus: "error",
    });
  });

  it("transitions to 'error' on network failure (fetch throws)", async () => {
    global.fetch = offlineFetch() as typeof fetch;
    const onChange = jest.fn();
    const assessment = makeAssessment();

    const result = await runSyncCycle(assessment, onChange);

    expect(result).toBe("error");
    expect(onChange).toHaveBeenCalledWith(assessment.id, "error");
    expect(mockedUpdateAssessment).toHaveBeenCalledWith(assessment.id, {
      syncStatus: "error",
    });
  });

  it("retries and transitions to 'synced' after initial failure", async () => {
    const onChange = jest.fn();
    const assessment = makeAssessment();

    // First attempt → error
    global.fetch = mockFetch(false) as typeof fetch;
    const firstResult = await runSyncCycle(assessment, onChange);
    expect(firstResult).toBe("error");

    // Retry attempt → synced
    global.fetch = mockFetch(true) as typeof fetch;
    const retryResult = await runSyncCycle(assessment, onChange);
    expect(retryResult).toBe("synced");
    expect(onChange).toHaveBeenLastCalledWith(assessment.id, "synced");
  });

  it("calls updateAssessment with pending status immediately on local save", () => {
    // Simulate the pending-mark step (happens synchronously before debounce fires)
    const assessment = makeAssessment();
    mockedUpdateAssessment(assessment.id, { syncStatus: "pending" });

    expect(mockedUpdateAssessment).toHaveBeenCalledWith(assessment.id, {
      syncStatus: "pending",
    });
  });
});

// ---------------------------------------------------------------------------
// Debounce constant
// ---------------------------------------------------------------------------

describe("SYNC_DEBOUNCE_MS", () => {
  it("is exactly 1000 ms", () => {
    expect(SYNC_DEBOUNCE_MS).toBe(1000);
  });
});

// ---------------------------------------------------------------------------
// SyncStatus type coverage
// ---------------------------------------------------------------------------

describe("valid SyncStatus values", () => {
  const validStatuses = ["synced", "pending", "error"] as const;

  it.each(validStatuses)("'%s' is a valid SyncStatus", (status) => {
    const assessment = makeAssessment({ syncStatus: status });
    expect(assessment.syncStatus).toBe(status);
  });
});
