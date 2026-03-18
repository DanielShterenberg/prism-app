/**
 * Unit tests for BlockE — Frameworks & Treatments form block.
 *
 * Tests:
 *  - Renders all 4 fields with Hebrew labels
 *  - Pre-filled values are displayed
 *  - Field changes call updateAssessment and onUpdate with correct data
 *  - syncStatus is set to "pending" on every change
 *  - Textareas have resize-none and overflow-hidden
 *  - onUpdate is not called when updateAssessment returns null
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlockE from "../BlockE";
import * as localStorageLib from "@/lib/localStorage";
import type { Assessment } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("@/lib/localStorage", () => ({
  updateAssessment: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: "test-id-e01",
    createdAt: "2026-03-18T10:00:00.000Z",
    updatedAt: "2026-03-18T10:00:00.000Z",
    syncStatus: "synced",
    status: "in_progress",
    identification: {
      patientName: "ילד בדיקה",
      assessmentDate: "18/03/2026",
      assessmentTools: [],
      examiner: "",
      referralReason: "",
    },
    familyBackground: {},
    developmentalBackground: {},
    developmentalMilestones: {},
    frameworksAndTreatments: {},
    ...overrides,
  };
}

function mockUpdateReturns(assessment: Assessment) {
  (localStorageLib.updateAssessment as jest.Mock).mockReturnValue(assessment);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlockE", () => {
  const onUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateReturns(makeAssessment());
  });

  // -------------------------------------------------------------------------
  // Label rendering
  // -------------------------------------------------------------------------

  it("renders the educational frameworks label in Hebrew", () => {
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("מסגרות חינוכיות")).toBeInTheDocument();
  });

  it("renders the treatments label in Hebrew", () => {
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("טיפולים")).toBeInTheDocument();
  });

  it("renders the previous assessments label in Hebrew", () => {
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("הערכות קודמות")).toBeInTheDocument();
  });

  it("renders the treatment staff communication label in Hebrew", () => {
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("תקשורת עם צוות טיפולי")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Pre-filled values
  // -------------------------------------------------------------------------

  it("displays pre-filled educational frameworks value", () => {
    const assessment = makeAssessment({
      frameworksAndTreatments: {
        educationalFrameworks: "גן חובה רגיל, שנתיים",
      },
    });
    render(<BlockE assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("מסגרות חינוכיות")).toHaveValue(
      "גן חובה רגיל, שנתיים"
    );
  });

  it("displays pre-filled treatments value", () => {
    const assessment = makeAssessment({
      frameworksAndTreatments: { treatments: "ריפוי בעיסוק, קלינאות תקשורת" },
    });
    render(<BlockE assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("טיפולים")).toHaveValue(
      "ריפוי בעיסוק, קלינאות תקשורת"
    );
  });

  // -------------------------------------------------------------------------
  // Auto-save behaviour
  // -------------------------------------------------------------------------

  it("calls updateAssessment when educational frameworks field changes", () => {
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("מסגרות חינוכיות"), {
      target: { value: "כיתה א׳ בבית ספר רגיל" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-e01",
      expect.objectContaining({
        frameworksAndTreatments: expect.objectContaining({
          educationalFrameworks: "כיתה א׳ בבית ספר רגיל",
        }),
      })
    );
  });

  it("calls updateAssessment when treatments field changes", () => {
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("טיפולים"), {
      target: { value: "פסיכותרפיה שבועית" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-e01",
      expect.objectContaining({
        frameworksAndTreatments: expect.objectContaining({
          treatments: "פסיכותרפיה שבועית",
        }),
      })
    );
  });

  it("calls updateAssessment when previous assessments field changes", () => {
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("הערכות קודמות"), {
      target: { value: "הערכה פסיכולוגית בגיל 4" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-e01",
      expect.objectContaining({
        frameworksAndTreatments: expect.objectContaining({
          previousAssessments: "הערכה פסיכולוגית בגיל 4",
        }),
      })
    );
  });

  it("calls updateAssessment when treatment staff communication field changes", () => {
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("תקשורת עם צוות טיפולי"), {
      target: { value: "תקשורת סדירה עם הצוות" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-e01",
      expect.objectContaining({
        frameworksAndTreatments: expect.objectContaining({
          treatmentStaffCommunication: "תקשורת סדירה עם הצוות",
        }),
      })
    );
  });

  it("calls onUpdate with the updated assessment after a field change", () => {
    const updated = makeAssessment({
      frameworksAndTreatments: { treatments: "ABA" },
    });
    mockUpdateReturns(updated);

    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("טיפולים"), {
      target: { value: "ABA" },
    });
    expect(onUpdate).toHaveBeenCalledWith(updated);
  });

  it("does not call onUpdate when updateAssessment returns null", () => {
    (localStorageLib.updateAssessment as jest.Mock).mockReturnValue(null);
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("טיפולים"), {
      target: { value: "פיזיותרפיה" },
    });
    expect(onUpdate).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Sync status
  // -------------------------------------------------------------------------

  it("passes syncStatus=pending to updateAssessment on every field change", () => {
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("הערכות קודמות"), {
      target: { value: "אין" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-e01",
      expect.objectContaining({ syncStatus: "pending" })
    );
  });

  // -------------------------------------------------------------------------
  // Textarea attributes
  // -------------------------------------------------------------------------

  it("all textareas have resize-none and overflow-hidden classes", () => {
    render(<BlockE assessment={makeAssessment()} onUpdate={onUpdate} />);
    const labels = [
      "מסגרות חינוכיות",
      "טיפולים",
      "הערכות קודמות",
      "תקשורת עם צוות טיפולי",
    ];
    for (const label of labels) {
      const el = screen.getByLabelText(label);
      expect(el).toHaveClass("resize-none");
      expect(el).toHaveClass("overflow-hidden");
    }
  });
});
