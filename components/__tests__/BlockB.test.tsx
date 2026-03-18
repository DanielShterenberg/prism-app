/**
 * Unit tests for BlockB — Family Background form block.
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
import BlockB from "../BlockB";
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
    id: "test-id-456",
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

describe("BlockB", () => {
  const onUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateReturns(makeAssessment());
  });

  // -------------------------------------------------------------------------
  // Label rendering
  // -------------------------------------------------------------------------

  it("renders the father label in Hebrew", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("אב")).toBeInTheDocument();
  });

  it("renders the mother label in Hebrew", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("אם")).toBeInTheDocument();
  });

  it("renders the parent status label in Hebrew", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("מצב הורים")).toBeInTheDocument();
  });

  it("renders the city label in Hebrew", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("עיר")).toBeInTheDocument();
  });

  it("renders the siblings label in Hebrew", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("אחים/אחיות")).toBeInTheDocument();
  });

  it("renders the family diagnoses label in Hebrew", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("אבחנות במשפחה")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Pre-filled values
  // -------------------------------------------------------------------------

  it("displays pre-filled father value", () => {
    const assessment = makeAssessment({
      familyBackground: { father: "אב בריא, עובד בהייטק" },
    });
    render(<BlockB assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("אב")).toHaveValue("אב בריא, עובד בהייטק");
  });

  it("displays pre-filled city value", () => {
    const assessment = makeAssessment({
      familyBackground: { city: "תל אביב" },
    });
    render(<BlockB assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("עיר")).toHaveValue("תל אביב");
  });

  // -------------------------------------------------------------------------
  // Auto-save behaviour
  // -------------------------------------------------------------------------

  it("calls updateAssessment when father field changes", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("אב"), {
      target: { value: "אב עם היסטוריה רפואית" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-456",
      expect.objectContaining({
        familyBackground: expect.objectContaining({
          father: "אב עם היסטוריה רפואית",
        }),
      })
    );
  });

  it("calls updateAssessment when city field changes", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("עיר"), {
      target: { value: "ירושלים" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-456",
      expect.objectContaining({
        familyBackground: expect.objectContaining({ city: "ירושלים" }),
      })
    );
  });

  it("calls updateAssessment when family diagnoses field changes", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("אבחנות במשפחה"), {
      target: { value: "ADHD אצל האב" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-456",
      expect.objectContaining({
        familyBackground: expect.objectContaining({
          familyDiagnoses: "ADHD אצל האב",
        }),
      })
    );
  });

  it("calls onUpdate with the updated assessment after a field change", () => {
    const updated = makeAssessment({
      familyBackground: { mother: "אם בריאה" },
    });
    mockUpdateReturns(updated);

    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("אם"), {
      target: { value: "אם בריאה" },
    });
    expect(onUpdate).toHaveBeenCalledWith(updated);
  });

  it("does not call onUpdate when updateAssessment returns null", () => {
    (localStorageLib.updateAssessment as jest.Mock).mockReturnValue(null);
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("עיר"), {
      target: { value: "חיפה" },
    });
    expect(onUpdate).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Sync status
  // -------------------------------------------------------------------------

  it("passes syncStatus=pending to updateAssessment on every field change", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("מצב הורים"), {
      target: { value: "נשואים" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-456",
      expect.objectContaining({ syncStatus: "pending" })
    );
  });

  // -------------------------------------------------------------------------
  // Textarea attributes
  // -------------------------------------------------------------------------

  it("father textarea has resize-none and overflow-hidden classes", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    const textarea = screen.getByLabelText("אב");
    expect(textarea).toHaveClass("resize-none");
    expect(textarea).toHaveClass("overflow-hidden");
  });

  it("siblings textarea has resize-none and overflow-hidden classes", () => {
    render(<BlockB assessment={makeAssessment()} onUpdate={onUpdate} />);
    const textarea = screen.getByLabelText("אחים/אחיות");
    expect(textarea).toHaveClass("resize-none");
    expect(textarea).toHaveClass("overflow-hidden");
  });
});
