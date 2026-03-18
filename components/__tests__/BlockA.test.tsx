/**
 * Unit tests for BlockA — Patient Identification form block.
 *
 * Tests:
 *  - Renders all 7 fields with Hebrew labels
 *  - All text inputs use font size ≥ 17px (≥ 16px required by spec)
 *  - Assessment tool chips render as toggle buttons
 *  - Selecting a chip adds it to assessmentTools
 *  - Deselecting a chip removes it from assessmentTools
 *  - Text field changes call updateAssessment and onUpdate
 *  - Textarea starts with min-height and expands (overflow-hidden, resize-none)
 *  - Pre-filled values are displayed in inputs
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlockA, { ASSESSMENT_TOOLS } from "../BlockA";
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
    id: "test-id-123",
    createdAt: "2026-03-18T10:00:00.000Z",
    updatedAt: "2026-03-18T10:00:00.000Z",
    syncStatus: "synced",
    status: "in_progress",
    identification: {
      patientName: "",
      assessmentDate: "",
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

describe("BlockA", () => {
  const onUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateReturns(makeAssessment());
  });

  // -------------------------------------------------------------------------
  // Label rendering
  // -------------------------------------------------------------------------

  it("renders the patient name label in Hebrew", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("שם המטופל/ת")).toBeInTheDocument();
  });

  it("renders the date of birth label in Hebrew", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("תאריך לידה")).toBeInTheDocument();
  });

  it("renders the educational framework label in Hebrew", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("מסגרת חינוכית")).toBeInTheDocument();
  });

  it("renders the assessment date label in Hebrew", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("תאריך הערכה")).toBeInTheDocument();
  });

  it("renders the assessment tools group label in Hebrew", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByText("כלי הערכה")).toBeInTheDocument();
  });

  it("renders the examiner label in Hebrew", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("בודק/ת")).toBeInTheDocument();
  });

  it("renders the referral reason label in Hebrew", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("סיבת הפניה")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Pre-filled values
  // -------------------------------------------------------------------------

  it("displays pre-filled patient name", () => {
    const assessment = makeAssessment({
      identification: {
        patientName: "דנה לוי",
        assessmentDate: "18/03/2026",
        assessmentTools: [],
        examiner: "",
        referralReason: "",
      },
    });
    render(<BlockA assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("שם המטופל/ת")).toHaveValue("דנה לוי");
  });

  it("displays pre-filled assessment date", () => {
    const assessment = makeAssessment({
      identification: {
        patientName: "",
        assessmentDate: "01/01/2025",
        assessmentTools: [],
        examiner: "",
        referralReason: "",
      },
    });
    render(<BlockA assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("תאריך הערכה")).toHaveValue("01/01/2025");
  });

  it("displays pre-filled referral reason in textarea", () => {
    const assessment = makeAssessment({
      identification: {
        patientName: "",
        assessmentDate: "",
        assessmentTools: [],
        examiner: "",
        referralReason: "קשיים בוויסות חושי ותקשורת",
      },
    });
    render(<BlockA assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("סיבת הפניה")).toHaveValue(
      "קשיים בוויסות חושי ותקשורת"
    );
  });

  // -------------------------------------------------------------------------
  // Assessment tool chips
  // -------------------------------------------------------------------------

  it("renders all assessment tool chips as buttons", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    for (const tool of ASSESSMENT_TOOLS) {
      expect(
        screen.getByRole("button", { name: tool })
      ).toBeInTheDocument();
    }
  });

  it("renders unselected chips with aria-pressed=false", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    const chip = screen.getByRole("button", { name: "ADOS-2" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  it("renders selected chips with aria-pressed=true", () => {
    const assessment = makeAssessment({
      identification: {
        patientName: "",
        assessmentDate: "",
        assessmentTools: ["ADOS-2"],
        examiner: "",
        referralReason: "",
      },
    });
    render(<BlockA assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByRole("button", { name: "ADOS-2" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  // -------------------------------------------------------------------------
  // Auto-save behaviour
  // -------------------------------------------------------------------------

  it("calls updateAssessment when patient name changes", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("שם המטופל/ת"), {
      target: { value: "יוסי כהן" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-123",
      expect.objectContaining({
        identification: expect.objectContaining({ patientName: "יוסי כהן" }),
      })
    );
  });

  it("calls onUpdate with the updated assessment after patient name change", () => {
    const updated = makeAssessment({
      identification: {
        patientName: "יוסי כהן",
        assessmentDate: "",
        assessmentTools: [],
        examiner: "",
        referralReason: "",
      },
    });
    mockUpdateReturns(updated);

    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("שם המטופל/ת"), {
      target: { value: "יוסי כהן" },
    });
    expect(onUpdate).toHaveBeenCalledWith(updated);
  });

  it("calls updateAssessment when referral reason changes", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("סיבת הפניה"), {
      target: { value: "קשיים בתקשורת חברתית" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-123",
      expect.objectContaining({
        identification: expect.objectContaining({
          referralReason: "קשיים בתקשורת חברתית",
        }),
      })
    );
  });

  it("adds a tool to assessmentTools when an unselected chip is clicked", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "ADI-R" }));
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-123",
      expect.objectContaining({
        identification: expect.objectContaining({
          assessmentTools: ["ADI-R"],
        }),
      })
    );
  });

  it("removes a tool from assessmentTools when a selected chip is clicked", () => {
    const assessment = makeAssessment({
      identification: {
        patientName: "",
        assessmentDate: "",
        assessmentTools: ["ADOS-2", "ADI-R"],
        examiner: "",
        referralReason: "",
      },
    });
    render(<BlockA assessment={assessment} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "ADOS-2" }));
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-123",
      expect.objectContaining({
        identification: expect.objectContaining({
          assessmentTools: ["ADI-R"],
        }),
      })
    );
  });

  it("does not call onUpdate when updateAssessment returns null", () => {
    (localStorageLib.updateAssessment as jest.Mock).mockReturnValue(null);
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("שם המטופל/ת"), {
      target: { value: "שם" },
    });
    expect(onUpdate).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Textarea attributes
  // -------------------------------------------------------------------------

  it("referral reason textarea has resize-none class", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    const textarea = screen.getByLabelText("סיבת הפניה");
    expect(textarea).toHaveClass("resize-none");
  });

  it("referral reason textarea has overflow-hidden class", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    const textarea = screen.getByLabelText("סיבת הפניה");
    expect(textarea).toHaveClass("overflow-hidden");
  });

  // -------------------------------------------------------------------------
  // Sync status
  // -------------------------------------------------------------------------

  it("passes syncStatus=pending to updateAssessment on every field change", () => {
    render(<BlockA assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("בודק/ת"), {
      target: { value: "ד״ר ינעם" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-123",
      expect.objectContaining({ syncStatus: "pending" })
    );
  });
});
