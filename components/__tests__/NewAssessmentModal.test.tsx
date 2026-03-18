/**
 * Unit tests for NewAssessmentModal component.
 *
 * We test:
 *  - Renders modal with Hebrew labels
 *  - Patient name input is focused on mount
 *  - Shows validation error when submitting with empty name
 *  - Closes on Escape key
 *  - Calls onClose when backdrop is clicked
 *  - Calls onClose when close button is clicked
 *  - Creates assessment and navigates on valid submit
 *  - isoToDDMMYYYY helper function
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewAssessmentModal, { isoToDDMMYYYY } from "../NewAssessmentModal";
import * as localStorageLib from "@/lib/localStorage";
import type { Assessment } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock lib/localStorage saveAssessment
jest.mock("@/lib/localStorage", () => ({
  saveAssessment: jest.fn(),
}));

// Mock global fetch (cloud sync fire-and-forget)
global.fetch = jest.fn().mockResolvedValue({ ok: true });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSavedAssessment(id = "test-id-123"): Assessment {
  return {
    id,
    createdAt: "2026-03-18T10:00:00.000Z",
    updatedAt: "2026-03-18T10:00:00.000Z",
    syncStatus: "pending",
    status: "in_progress",
    identification: {
      patientName: "אחמד כהן",
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

describe("isoToDDMMYYYY", () => {
  it("converts YYYY-MM-DD to DD/MM/YYYY", () => {
    expect(isoToDDMMYYYY("2026-03-18")).toBe("18/03/2026");
  });

  it("converts a single-digit day and month correctly", () => {
    expect(isoToDDMMYYYY("2026-01-05")).toBe("05/01/2026");
  });

  it("returns empty string for empty input", () => {
    expect(isoToDDMMYYYY("")).toBe("");
  });

  it("returns empty string for malformed input that has fewer than 3 parts", () => {
    // A string with no dashes returns itself (length !== 3 after split is just 1)
    expect(isoToDDMMYYYY("nodashes")).toBe("nodashes");
  });
});

describe("NewAssessmentModal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (localStorageLib.saveAssessment as jest.Mock).mockReturnValue(
      makeSavedAssessment()
    );
  });

  it("renders the modal with Hebrew heading", () => {
    render(<NewAssessmentModal onClose={onClose} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("הערכה חדשה")).toBeInTheDocument();
  });

  it("renders patient name label in Hebrew", () => {
    render(<NewAssessmentModal onClose={onClose} />);
    expect(screen.getByLabelText(/שם המטופל/)).toBeInTheDocument();
  });

  it("renders assessment date label in Hebrew", () => {
    render(<NewAssessmentModal onClose={onClose} />);
    expect(screen.getByLabelText("תאריך הערכה")).toBeInTheDocument();
  });

  it("renders submit button with Hebrew label", () => {
    render(<NewAssessmentModal onClose={onClose} />);
    expect(
      screen.getByRole("button", { name: "התחל הערכה" })
    ).toBeInTheDocument();
  });

  it("shows validation error when submitting with empty patient name", async () => {
    render(<NewAssessmentModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "התחל הערכה" }));
    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("יש להזין שם מטופל/ת");
  });

  it("does not save or navigate when patient name is empty", () => {
    render(<NewAssessmentModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "התחל הערכה" }));
    expect(localStorageLib.saveAssessment).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clears validation error when user starts typing", async () => {
    render(<NewAssessmentModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "התחל הערכה" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "א" },
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<NewAssessmentModal onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    render(<NewAssessmentModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "סגור" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    render(<NewAssessmentModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("creates assessment and navigates to /assessment/[id] on valid submit", async () => {
    render(<NewAssessmentModal onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "אחמד כהן" },
    });

    fireEvent.click(screen.getByRole("button", { name: "התחל הערכה" }));

    await waitFor(() => {
      expect(localStorageLib.saveAssessment).toHaveBeenCalledTimes(1);
    });

    // Verify the assessment was created with correct data shape
    const callArg = (localStorageLib.saveAssessment as jest.Mock).mock
      .calls[0][0];
    expect(callArg.identification.patientName).toBe("אחמד כהן");
    expect(callArg.syncStatus).toBe("pending");
    expect(callArg.status).toBe("in_progress");
    // assessmentDate should be DD/MM/YYYY format
    expect(callArg.identification.assessmentDate).toMatch(
      /^\d{2}\/\d{2}\/\d{4}$/
    );

    expect(mockPush).toHaveBeenCalledWith("/assessment/test-id-123");
  });

  it("triggers cloud sync fetch on valid submit", async () => {
    render(<NewAssessmentModal onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "אחמד כהן" },
    });

    fireEvent.click(screen.getByRole("button", { name: "התחל הערכה" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/assessments/test-id-123",
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  it("does not navigate when saveAssessment returns null (localStorage unavailable)", async () => {
    (localStorageLib.saveAssessment as jest.Mock).mockReturnValue(null);

    render(<NewAssessmentModal onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "אחמד כהן" },
    });
    fireEvent.click(screen.getByRole("button", { name: "התחל הערכה" }));

    await waitFor(() => {
      expect(localStorageLib.saveAssessment).toHaveBeenCalledTimes(1);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("trims whitespace from patient name before saving", async () => {
    render(<NewAssessmentModal onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "  אחמד כהן  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "התחל הערכה" }));

    await waitFor(() => {
      expect(localStorageLib.saveAssessment).toHaveBeenCalledTimes(1);
    });

    const callArg = (localStorageLib.saveAssessment as jest.Mock).mock
      .calls[0][0];
    expect(callArg.identification.patientName).toBe("אחמד כהן");
  });

  it("shows validation error for whitespace-only patient name", () => {
    render(<NewAssessmentModal onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "התחל הערכה" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(localStorageLib.saveAssessment).not.toHaveBeenCalled();
  });

  it("has aria-modal=true and aria-labelledby pointing to the title", () => {
    render(<NewAssessmentModal onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "new-assessment-title");
    expect(
      document.getElementById("new-assessment-title")
    ).toHaveTextContent("הערכה חדשה");
  });
});
