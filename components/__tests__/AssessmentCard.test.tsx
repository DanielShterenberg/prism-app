/**
 * Unit tests for AssessmentCard component.
 *
 * We test:
 *  - Rendering patient name, date, status badge, progress indicator
 *  - Correct Hebrew labels for each AssessmentStatus
 *  - Correct sync dot aria-label for each SyncStatus
 *  - Fallback patient name when identification.patientName is empty
 *  - onClick callback invoked with the assessment id
 *  - countFilledBlocks logic via rendered progress text
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AssessmentCard from "../AssessmentCard";
import type { Assessment } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Test environment setup — jsdom does not have @testing-library/react by
// default so we import from the package directly.
// ---------------------------------------------------------------------------

// If @testing-library/react is not installed the test suite will fail at
// import time with a clear error message.

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: "abc-123",
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
    syncStatus: "synced",
    status: "in_progress",
    identification: {
      patientName: "אחמד כהן",
      assessmentDate: "10/01/2026",
      assessmentTools: ["ADOS-2"],
      examiner: "ינם",
      referralReason: "חשד לאוטיזם",
    },
    familyBackground: {},
    developmentalBackground: {},
    developmentalMilestones: {},
    frameworksAndTreatments: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AssessmentCard", () => {
  it("renders patient name", () => {
    render(<AssessmentCard assessment={makeAssessment()} />);
    expect(screen.getByText("אחמד כהן")).toBeInTheDocument();
  });

  it("renders assessment date", () => {
    render(<AssessmentCard assessment={makeAssessment()} />);
    expect(screen.getByText("10/01/2026")).toBeInTheDocument();
  });

  it("renders Hebrew status badge for in_progress", () => {
    render(<AssessmentCard assessment={makeAssessment({ status: "in_progress" })} />);
    expect(screen.getByText("בתהליך")).toBeInTheDocument();
  });

  it("renders Hebrew status badge for completed", () => {
    render(<AssessmentCard assessment={makeAssessment({ status: "completed" })} />);
    expect(screen.getByText("הושלם")).toBeInTheDocument();
  });

  it("shows sync dot with correct aria-label for synced", () => {
    render(<AssessmentCard assessment={makeAssessment({ syncStatus: "synced" })} />);
    expect(screen.getByRole("status", { name: "נשמר בענן" })).toBeInTheDocument();
  });

  it("shows sync dot with correct aria-label for pending", () => {
    render(<AssessmentCard assessment={makeAssessment({ syncStatus: "pending" })} />);
    expect(screen.getByRole("status", { name: "מסנכרן..." })).toBeInTheDocument();
  });

  it("shows sync dot with correct aria-label for error", () => {
    render(<AssessmentCard assessment={makeAssessment({ syncStatus: "error" })} />);
    expect(screen.getByRole("status", { name: "שמור מקומית בלבד" })).toBeInTheDocument();
  });

  it("shows '1 מתוך 5 בלוקים' when only identification is filled", () => {
    // identification has patientName filled, others are empty objects
    render(<AssessmentCard assessment={makeAssessment()} />);
    expect(screen.getByText("1 מתוך 5 בלוקים")).toBeInTheDocument();
  });

  it("shows '0 מתוך 5 בלוקים' when all blocks are empty", () => {
    const assessment = makeAssessment({
      identification: {
        patientName: "",
        assessmentDate: "",
        assessmentTools: [],
        examiner: "",
        referralReason: "",
      },
    });
    render(<AssessmentCard assessment={assessment} />);
    expect(screen.getByText("0 מתוך 5 בלוקים")).toBeInTheDocument();
  });

  it("counts filled blocks correctly when multiple blocks have data", () => {
    const assessment = makeAssessment({
      familyBackground: { father: "אבי" },
      developmentalBackground: { pregnancy: "תקינה" },
    });
    // identification (1) + familyBackground (1) + developmentalBackground (1) = 3
    render(<AssessmentCard assessment={assessment} />);
    expect(screen.getByText("3 מתוך 5 בלוקים")).toBeInTheDocument();
  });

  it("shows all 5 blocks when all blocks have data", () => {
    const assessment = makeAssessment({
      familyBackground: { father: "אבי" },
      developmentalBackground: { pregnancy: "תקינה" },
      developmentalMilestones: { firstWordsAge: "12" },
      frameworksAndTreatments: { treatments: "ריפוי בעיסוק" },
    });
    render(<AssessmentCard assessment={assessment} />);
    expect(screen.getByText("5 מתוך 5 בלוקים")).toBeInTheDocument();
  });

  it("uses 'ללא שם' as fallback when patientName is empty", () => {
    const assessment = makeAssessment({
      identification: {
        patientName: "",
        assessmentDate: "10/01/2026",
        assessmentTools: [],
        examiner: "",
        referralReason: "",
      },
    });
    render(<AssessmentCard assessment={assessment} />);
    expect(screen.getByText("ללא שם")).toBeInTheDocument();
  });

  it("calls onClick with the assessment id when clicked", () => {
    const onClick = jest.fn();
    render(<AssessmentCard assessment={makeAssessment()} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith("abc-123");
  });

  it("does not crash when onClick is not provided", () => {
    render(<AssessmentCard assessment={makeAssessment()} />);
    expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
  });
});
