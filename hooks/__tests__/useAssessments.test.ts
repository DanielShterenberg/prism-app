/**
 * Unit tests for useAssessments hook.
 *
 * We test:
 *  - Initial load from localStorage (no network)
 *  - loading flag starts true and becomes false after initial read
 *  - Cloud reconciliation: missing local records are written from cloud
 *  - Cloud reconciliation: newer cloud records overwrite stale local ones
 *  - Cloud reconciliation: newer local records are NOT overwritten
 *  - cloudError is set when fetch fails
 *  - syncing flag is true during cloud fetch and false after
 *  - refresh() triggers a new localStorage read
 *
 * We mock:
 *  - lib/localStorage (listAssessments, saveAssessment, updateAssessment, getAssessment)
 *  - global fetch
 *
 * We use renderHook from @testing-library/react (re-exported from jest-environment-jsdom).
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useAssessments } from "../useAssessments";
import type { Assessment } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Mock lib/localStorage
// ---------------------------------------------------------------------------

jest.mock("@/lib/localStorage", () => ({
  listAssessments: jest.fn(),
  updateAssessment: jest.fn(),
  getAssessment: jest.fn(),
}));

import {
  listAssessments,
  updateAssessment,
  getAssessment,
} from "@/lib/localStorage";

const mockListAssessments = listAssessments as jest.Mock;
const mockUpdateAssessment = updateAssessment as jest.Mock;
const mockGetAssessment = getAssessment as jest.Mock;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: "test-id-001",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    syncStatus: "synced",
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

function mockFetchOk(data: unknown): jest.Mock {
  return jest.fn(async () => ({
    ok: true,
    json: async () => data,
  }));
}

function mockFetchError(): jest.Mock {
  return jest.fn(async () => ({ ok: false, status: 500 }));
}

function mockFetchNetworkError(): jest.Mock {
  return jest.fn(async () => {
    throw new Error("Network error");
  });
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  // Default: empty localStorage
  mockListAssessments.mockReturnValue([]);
  mockGetAssessment.mockReturnValue(null);
  mockUpdateAssessment.mockReturnValue(makeAssessment());
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useAssessments", () => {
  it("loads assessments from localStorage on mount", async () => {
    const local = [makeAssessment()];
    mockListAssessments.mockReturnValue(local);
    // Cloud returns empty — no reconciliation
    global.fetch = mockFetchOk([]);

    const { result } = renderHook(() => useAssessments());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.assessments).toEqual(local);
  });

  it("sets loading to false after initial read", async () => {
    mockListAssessments.mockReturnValue([]);
    global.fetch = mockFetchOk([]);

    const { result } = renderHook(() => useAssessments());

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("writes cloud record to localStorage when missing locally", async () => {
    const cloudRecord = makeAssessment({ id: "cloud-only" });
    mockListAssessments.mockReturnValue([]);
    mockGetAssessment.mockReturnValue(null);
    global.fetch = mockFetchOk([cloudRecord]);

    // Spy on localStorage.setItem to verify the cloud record is written with the correct key
    const setItemMock = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});

    const { result } = renderHook(() => useAssessments());

    await waitFor(() => expect(result.current.syncing).toBe(false));

    // localStorage.setItem called with the canonical prism:assessment:{id} key
    expect(setItemMock).toHaveBeenCalledWith(
      `prism:assessment:${cloudRecord.id}`,
      expect.stringContaining(cloudRecord.id)
    );

    setItemMock.mockRestore();
  });

  it("updates localStorage when cloud record is newer than local", async () => {
    const localRecord = makeAssessment({
      id: "shared-id",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const cloudRecord = makeAssessment({
      id: "shared-id",
      updatedAt: "2026-01-02T00:00:00.000Z", // newer
    });

    mockListAssessments.mockReturnValue([localRecord]);
    mockGetAssessment.mockReturnValue(localRecord);
    global.fetch = mockFetchOk([cloudRecord]);

    const { result } = renderHook(() => useAssessments());

    await waitFor(() => expect(result.current.syncing).toBe(false));

    expect(mockUpdateAssessment).toHaveBeenCalledWith(
      "shared-id",
      expect.objectContaining({ syncStatus: "synced" })
    );
  });

  it("does NOT update localStorage when local record is newer than cloud", async () => {
    const localRecord = makeAssessment({
      id: "shared-id",
      updatedAt: "2026-01-03T00:00:00.000Z", // newer
    });
    const cloudRecord = makeAssessment({
      id: "shared-id",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    mockListAssessments.mockReturnValue([localRecord]);
    mockGetAssessment.mockReturnValue(localRecord);
    global.fetch = mockFetchOk([cloudRecord]);

    renderHook(() => useAssessments());

    // Wait for reconciliation to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(mockUpdateAssessment).not.toHaveBeenCalled();
  });

  it("sets cloudError when fetch returns non-ok status", async () => {
    mockListAssessments.mockReturnValue([]);
    global.fetch = mockFetchError();

    const { result } = renderHook(() => useAssessments());

    await waitFor(() => expect(result.current.syncing).toBe(false));
    expect(result.current.cloudError).toBeInstanceOf(Error);
    expect(result.current.cloudError?.message).toContain("HTTP 500");
  });

  it("sets cloudError when fetch throws a network error", async () => {
    mockListAssessments.mockReturnValue([]);
    global.fetch = mockFetchNetworkError();

    const { result } = renderHook(() => useAssessments());

    await waitFor(() => expect(result.current.syncing).toBe(false));
    expect(result.current.cloudError).toBeInstanceOf(Error);
  });

  it("syncing is true while fetch is in flight and false after", async () => {
    mockListAssessments.mockReturnValue([]);
    let resolveFetch!: (v: unknown) => void;
    global.fetch = jest.fn(
      () =>
        new Promise((res) => {
          resolveFetch = res;
        })
    ) as jest.Mock;

    const { result } = renderHook(() => useAssessments());

    // Syncing should be true while the promise is pending
    await waitFor(() => expect(result.current.syncing).toBe(true));

    // Resolve the fetch
    act(() => {
      resolveFetch({ ok: true, json: async () => [] });
    });

    await waitFor(() => expect(result.current.syncing).toBe(false));
  });

  it("refresh() re-reads from localStorage", async () => {
    const initial = [makeAssessment({ id: "a1" })];
    const afterRefresh = [makeAssessment({ id: "a1" }), makeAssessment({ id: "a2" })];

    mockListAssessments
      .mockReturnValueOnce(initial)
      .mockReturnValueOnce(afterRefresh);
    global.fetch = mockFetchOk([]);

    const { result } = renderHook(() => useAssessments());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.assessments).toEqual(initial);

    act(() => {
      result.current.refresh();
    });

    await waitFor(() =>
      expect(result.current.assessments).toEqual(afterRefresh)
    );
  });
});
