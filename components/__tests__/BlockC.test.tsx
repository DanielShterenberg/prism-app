/**
 * Unit tests for BlockC — Developmental Background form block.
 *
 * Tests:
 *  - Renders all 6 fields with Hebrew labels
 *  - Pre-filled values are displayed
 *  - Field changes call updateAssessment and onUpdate with correct data
 *  - syncStatus is set to "pending" on every change
 *  - Textareas have resize-none and overflow-hidden
 *  - onUpdate is not called when updateAssessment returns null
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlockC from "../BlockC";
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
    id: "test-id-789",
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

describe("BlockC", () => {
  const onUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateReturns(makeAssessment());
  });

  // -------------------------------------------------------------------------
  // Label rendering
  // -------------------------------------------------------------------------

  it("renders the pregnancy label in Hebrew", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("הריון")).toBeInTheDocument();
  });

  it("renders the pregnancy course label in Hebrew", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("מהלך ההריון")).toBeInTheDocument();
  });

  it("renders the birth label in Hebrew", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("לידה")).toBeInTheDocument();
  });

  it("renders the medical procedures label in Hebrew", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("פרוצדורות רפואיות")).toBeInTheDocument();
  });

  it("renders the breastfeeding label in Hebrew", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("הנקה")).toBeInTheDocument();
  });

  it("renders the first year difficulties label in Hebrew", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("קשיים בשנה הראשונה")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Pre-filled values
  // -------------------------------------------------------------------------

  it("displays pre-filled pregnancy value", () => {
    const assessment = makeAssessment({
      developmentalBackground: { pregnancy: "הריון ראשון, תקין" },
    });
    render(<BlockC assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("הריון")).toHaveValue("הריון ראשון, תקין");
  });

  it("displays pre-filled birth value", () => {
    const assessment = makeAssessment({
      developmentalBackground: { birth: "לידה בשבוע 39, ללא סיבוכים" },
    });
    render(<BlockC assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("לידה")).toHaveValue("לידה בשבוע 39, ללא סיבוכים");
  });

  // -------------------------------------------------------------------------
  // Auto-save behaviour
  // -------------------------------------------------------------------------

  it("calls updateAssessment when pregnancy field changes", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("הריון"), {
      target: { value: "הריון שני" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-789",
      expect.objectContaining({
        developmentalBackground: expect.objectContaining({
          pregnancy: "הריון שני",
        }),
      })
    );
  });

  it("calls updateAssessment when birth field changes", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("לידה"), {
      target: { value: "לידה בניתוח קיסרי" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-789",
      expect.objectContaining({
        developmentalBackground: expect.objectContaining({
          birth: "לידה בניתוח קיסרי",
        }),
      })
    );
  });

  it("calls updateAssessment when first year difficulties field changes", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("קשיים בשנה הראשונה"), {
      target: { value: "קשיי שינה וכי" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-789",
      expect.objectContaining({
        developmentalBackground: expect.objectContaining({
          firstYearDifficulties: "קשיי שינה וכי",
        }),
      })
    );
  });

  it("calls onUpdate with the updated assessment after a field change", () => {
    const updated = makeAssessment({
      developmentalBackground: { breastfeeding: "הנקה מלאה 6 חודשים" },
    });
    mockUpdateReturns(updated);

    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("הנקה"), {
      target: { value: "הנקה מלאה 6 חודשים" },
    });
    expect(onUpdate).toHaveBeenCalledWith(updated);
  });

  it("does not call onUpdate when updateAssessment returns null", () => {
    (localStorageLib.updateAssessment as jest.Mock).mockReturnValue(null);
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("הריון"), {
      target: { value: "הריון תקין" },
    });
    expect(onUpdate).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Sync status
  // -------------------------------------------------------------------------

  it("passes syncStatus=pending to updateAssessment on every field change", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("פרוצדורות רפואיות"), {
      target: { value: "אין" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-789",
      expect.objectContaining({ syncStatus: "pending" })
    );
  });

  // -------------------------------------------------------------------------
  // Textarea attributes
  // -------------------------------------------------------------------------

  it("all textareas have resize-none and overflow-hidden classes", () => {
    render(<BlockC assessment={makeAssessment()} onUpdate={onUpdate} />);
    const labels = [
      "הריון",
      "מהלך ההריון",
      "לידה",
      "פרוצדורות רפואיות",
      "הנקה",
      "קשיים בשנה הראשונה",
    ];
    for (const label of labels) {
      const el = screen.getByLabelText(label);
      expect(el).toHaveClass("resize-none");
      expect(el).toHaveClass("overflow-hidden");
    }
  });
});
