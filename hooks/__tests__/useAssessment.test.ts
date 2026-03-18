/**
 * Unit tests for useAssessment hook.
 *
 * Tests:
 *  - Returns assessment immediately when found in localStorage
 *  - Returns notFound=true when not found
 *  - Returns notFound=true when id is empty string
 *  - Calls getAssessment with the provided id
 *  - refresh() re-reads from localStorage and updates state
 */

import { renderHook, act } from "@testing-library/react";
import { useAssessment } from "../useAssessment";
import * as localStorageLib from "@/lib/localStorage";
import type { Assessment } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("@/lib/localStorage", () => ({
  getAssessment: jest.fn(),
}));

const mockGetAssessment = localStorageLib.getAssessment as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAssessment(id = "abc-123"): Assessment {
  return {
    id,
    createdAt: "2026-03-18T10:00:00.000Z",
    updatedAt: "2026-03-18T10:00:00.000Z",
    syncStatus: "synced",
    status: "in_progress",
    identification: {
      patientName: "Test Patient",
      assessmentDate: "18/03/2026",
      assessmentTools: [],
      examiner: "",
      referralReason: "",
    },
    familyBackground: {},
    developmentalBackground: {},
    developmentalMilestones: {},
    frameworksAndTreatments: {},
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useAssessment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the assessment when found in localStorage", () => {
    const assessment = makeAssessment();
    mockGetAssessment.mockReturnValue(assessment);

    const { result } = renderHook(() => useAssessment("abc-123"));

    expect(result.current.assessment).toEqual(assessment);
    expect(result.current.notFound).toBe(false);
  });

  it("returns notFound=true when assessment is not in localStorage", () => {
    mockGetAssessment.mockReturnValue(null);

    const { result } = renderHook(() => useAssessment("nonexistent-id"));

    expect(result.current.assessment).toBeNull();
    expect(result.current.notFound).toBe(true);
  });

  it("returns notFound=true when id is empty", () => {
    const { result } = renderHook(() => useAssessment(""));

    expect(result.current.assessment).toBeNull();
    expect(result.current.notFound).toBe(true);
    expect(mockGetAssessment).not.toHaveBeenCalled();
  });

  it("calls getAssessment with the provided id", () => {
    mockGetAssessment.mockReturnValue(makeAssessment());

    renderHook(() => useAssessment("abc-123"));

    expect(mockGetAssessment).toHaveBeenCalledWith("abc-123");
  });

  it("refresh() re-reads from localStorage and updates state", () => {
    const first = makeAssessment();
    const updated = { ...first, updatedAt: "2026-03-19T10:00:00.000Z" };

    mockGetAssessment.mockReturnValueOnce(first).mockReturnValueOnce(updated);

    const { result } = renderHook(() => useAssessment("abc-123"));
    expect(result.current.assessment?.updatedAt).toBe(first.updatedAt);

    act(() => {
      result.current.refresh();
    });

    expect(result.current.assessment?.updatedAt).toBe(updated.updatedAt);
  });
});
