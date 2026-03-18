/**
 * Unit tests for the anamnesis shell page (/assessment/[id]).
 *
 * Tests:
 *  - Shows "הערכה לא נמצאה" when assessment is not in localStorage
 *  - "חזרה לרשימה" button navigates to "/" when assessment not found
 *  - Renders patient name and assessment date in the header
 *  - Renders the BlockTabBar with all 5 blocks
 *  - Block A is active by default
 *  - Clicking a tab changes the active block
 *  - "סיום" button navigates to /assessment/[id]/summary
 *  - Completed blocks (those with data) show the checkmark in aria-label
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AssessmentPage from "../page";
import * as useAssessmentHook from "@/hooks/useAssessment";
import type { Assessment } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: "test-id-123" }),
}));

jest.mock("@/hooks/useAssessment");

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
    ...overrides,
  };
}

function mockFound(assessment: Assessment) {
  (useAssessmentHook.useAssessment as jest.Mock).mockReturnValue({
    assessment,
    notFound: false,
    refresh: jest.fn(),
  });
}

function mockNotFound() {
  (useAssessmentHook.useAssessment as jest.Mock).mockReturnValue({
    assessment: null,
    notFound: true,
    refresh: jest.fn(),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AssessmentPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 'הערכה לא נמצאה' when assessment is not found", () => {
    mockNotFound();
    render(<AssessmentPage />);
    expect(screen.getByText("הערכה לא נמצאה.")).toBeInTheDocument();
  });

  it("navigates to '/' when 'חזרה לרשימה' button is clicked on not-found screen", () => {
    mockNotFound();
    render(<AssessmentPage />);
    fireEvent.click(screen.getByRole("button", { name: "חזרה לרשימה" }));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("renders patient name in the header", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    expect(screen.getByText("אחמד כהן")).toBeInTheDocument();
  });

  it("renders assessment date in the header", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    expect(screen.getByText("18/03/2026")).toBeInTheDocument();
  });

  it("renders all 5 block tabs", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);

    expect(screen.getByRole("tab", { name: /בלוק A/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /בלוק B/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /בלוק C/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /בלוק D/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /בלוק E/ })).toBeInTheDocument();
  });

  it("sets block A as active by default", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    expect(screen.getByRole("tab", { name: /בלוק A/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("switches active block when a tab is clicked", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);

    fireEvent.click(screen.getByRole("tab", { name: /בלוק C/ }));

    expect(screen.getByRole("tab", { name: /בלוק C/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: /בלוק A/ })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("renders the סיום finish button", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    expect(screen.getByRole("button", { name: "סיום" })).toBeInTheDocument();
  });

  it("navigates to /assessment/[id]/summary when סיום is clicked", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    fireEvent.click(screen.getByRole("button", { name: "סיום" }));
    expect(mockPush).toHaveBeenCalledWith("/assessment/test-id-123/summary");
  });

  it("shows completed checkmark in aria-label for blocks with data", () => {
    // familyBackground has data → block B is completed
    mockFound(makeAssessment({ familyBackground: { father: "אבי" } }));
    render(<AssessmentPage />);

    expect(
      screen.getByRole("tab", { name: /בלוק B.*הושלם/ })
    ).toBeInTheDocument();
  });

  it("does not show completed checkmark for blocks without data", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);

    // B, C, D, E all have empty data — none should have הושלם
    for (const blockId of ["B", "C", "D", "E"]) {
      const label = screen
        .getByRole("tab", { name: new RegExp(`בלוק ${blockId}`) })
        .getAttribute("aria-label");
      expect(label).not.toContain("הושלם");
    }
  });

  it("renders back-to-list button in the header", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    expect(
      screen.getByRole("button", { name: "חזרה לרשימה" })
    ).toBeInTheDocument();
  });

  it("navigates to '/' when the header back button is clicked", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    fireEvent.click(screen.getByRole("button", { name: "חזרה לרשימה" }));
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
