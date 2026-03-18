/**
 * Unit tests for BlockD — Developmental Milestones form block.
 *
 * Tests:
 *  - Renders all age fields with Hebrew labels
 *  - Renders all textarea fields with Hebrew labels
 *  - Pre-filled values are displayed
 *  - Age field changes call updateAssessment with correct data
 *  - Textarea field changes call updateAssessment with correct data
 *  - syncStatus is set to "pending" on every change
 *  - Textareas have resize-none and overflow-hidden
 *  - onUpdate is not called when updateAssessment returns null
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlockD from "../BlockD";
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
    id: "test-id-d01",
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

describe("BlockD", () => {
  const onUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateReturns(makeAssessment());
  });

  // -------------------------------------------------------------------------
  // Age field label rendering
  // -------------------------------------------------------------------------

  it("renders the first words label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("מילה ראשונה")).toBeInTheDocument();
  });

  it("renders the word pairs label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("צמד מילים")).toBeInTheDocument();
  });

  it("renders the sentences label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("משפטים")).toBeInTheDocument();
  });

  it("renders the independent walking label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("הליכה עצמאית")).toBeInTheDocument();
  });

  it("renders the bladder control day label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("שליטה בסוגרים — יום")).toBeInTheDocument();
  });

  it("renders the bladder control night label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("שליטה בסוגרים — לילה")).toBeInTheDocument();
  });

  it("renders the bowel control label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("שליטה במעיים")).toBeInTheDocument();
  });

  it("renders the bike riding label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("רכיבה על אופניים")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Textarea field label rendering
  // -------------------------------------------------------------------------

  it("renders the language regression label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("רגרסיה בשפה")).toBeInTheDocument();
  });

  it("renders the motor clumsiness label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("מגושמות מוטורית")).toBeInTheDocument();
  });

  it("renders the falls tendency label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("נפילות")).toBeInTheDocument();
  });

  it("renders the climbing label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("טיפוס")).toBeInTheDocument();
  });

  it("renders the eating label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("אכילה")).toBeInTheDocument();
  });

  it("renders the sleep label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("שינה")).toBeInTheDocument();
  });

  it("renders the sensory regulation label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("ויסות חושי")).toBeInTheDocument();
  });

  it("renders the emotional regulation label in Hebrew", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("ויסות רגשי")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Pre-filled values
  // -------------------------------------------------------------------------

  it("displays pre-filled first words age", () => {
    const assessment = makeAssessment({
      developmentalMilestones: { firstWordsAge: "12" },
    });
    render(<BlockD assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("מילה ראשונה")).toHaveValue("12");
  });

  it("displays pre-filled eating textarea value", () => {
    const assessment = makeAssessment({
      developmentalMilestones: { eating: "אוכל מגוון, ללא קשיים" },
    });
    render(<BlockD assessment={assessment} onUpdate={onUpdate} />);
    expect(screen.getByLabelText("אכילה")).toHaveValue("אוכל מגוון, ללא קשיים");
  });

  // -------------------------------------------------------------------------
  // Auto-save behaviour — age fields
  // -------------------------------------------------------------------------

  it("calls updateAssessment when first words age changes", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("מילה ראשונה"), {
      target: { value: "14" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-d01",
      expect.objectContaining({
        developmentalMilestones: expect.objectContaining({
          firstWordsAge: "14",
        }),
      })
    );
  });

  it("calls updateAssessment when independent walking age changes", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("הליכה עצמאית"), {
      target: { value: "13" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-d01",
      expect.objectContaining({
        developmentalMilestones: expect.objectContaining({
          independentWalkingAge: "13",
        }),
      })
    );
  });

  it("calls updateAssessment when bladder control day changes", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("שליטה בסוגרים — יום"), {
      target: { value: "36" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-d01",
      expect.objectContaining({
        developmentalMilestones: expect.objectContaining({
          bladderControlDay: "36",
        }),
      })
    );
  });

  // -------------------------------------------------------------------------
  // Auto-save behaviour — textarea fields
  // -------------------------------------------------------------------------

  it("calls updateAssessment when language regression textarea changes", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("רגרסיה בשפה"), {
      target: { value: "רגרסיה בגיל 18 חודשים" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-d01",
      expect.objectContaining({
        developmentalMilestones: expect.objectContaining({
          languageRegression: "רגרסיה בגיל 18 חודשים",
        }),
      })
    );
  });

  it("calls updateAssessment when sensory regulation textarea changes", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("ויסות חושי"), {
      target: { value: "רגישות יתר לקולות" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-d01",
      expect.objectContaining({
        developmentalMilestones: expect.objectContaining({
          sensoryRegulation: "רגישות יתר לקולות",
        }),
      })
    );
  });

  it("calls onUpdate with the updated assessment after a field change", () => {
    const updated = makeAssessment({
      developmentalMilestones: { sleep: "קשיי הרדמות" },
    });
    mockUpdateReturns(updated);

    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("שינה"), {
      target: { value: "קשיי הרדמות" },
    });
    expect(onUpdate).toHaveBeenCalledWith(updated);
  });

  it("does not call onUpdate when updateAssessment returns null", () => {
    (localStorageLib.updateAssessment as jest.Mock).mockReturnValue(null);
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("מילה ראשונה"), {
      target: { value: "10" },
    });
    expect(onUpdate).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Sync status
  // -------------------------------------------------------------------------

  it("passes syncStatus=pending to updateAssessment on every field change", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByLabelText("ויסות רגשי"), {
      target: { value: "קשיי ויסות רגשי" },
    });
    expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
      "test-id-d01",
      expect.objectContaining({ syncStatus: "pending" })
    );
  });

  // -------------------------------------------------------------------------
  // Textarea attributes
  // -------------------------------------------------------------------------

  it("textarea fields have resize-none and overflow-hidden classes", () => {
    render(<BlockD assessment={makeAssessment()} onUpdate={onUpdate} />);
    const textareaLabels = [
      "רגרסיה בשפה",
      "מגושמות מוטורית",
      "נפילות",
      "טיפוס",
      "אכילה",
      "שינה",
      "ויסות חושי",
      "ויסות רגשי",
    ];
    for (const label of textareaLabels) {
      const el = screen.getByLabelText(label);
      expect(el).toHaveClass("resize-none");
      expect(el).toHaveClass("overflow-hidden");
    }
  });
});
