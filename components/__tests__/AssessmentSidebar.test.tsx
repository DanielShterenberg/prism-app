/**
 * Unit tests for AssessmentSidebar.
 *
 * Tests:
 *  - Renders the sidebar header "הערכות"
 *  - Renders a list of assessments from useAssessments
 *  - Shows skeleton rows while loading
 *  - Shows empty-state message when no assessments exist
 *  - Marks the active assessment with aria-current="page"
 *  - Clicking an assessment navigates to /assessment/[id]
 *  - Renders "הערכה חדשה" button when onNewAssessment is provided
 *  - "הערכה חדשה" button calls onNewAssessment when clicked
 *  - Does not render "הערכה חדשה" button when onNewAssessment is not provided
 *  - Assessment button shows patient name and status badge
 *  - aria-label includes patient name, date, and status
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AssessmentSidebar from "../AssessmentSidebar";
import * as useAssessmentsHook from "@/hooks/useAssessments";
import type { Assessment } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks/useAssessments");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: "assessment-abc",
    createdAt: "2026-03-18T10:00:00.000Z",
    updatedAt: "2026-03-18T10:00:00.000Z",
    syncStatus: "synced",
    status: "in_progress",
    identification: {
      patientName: "שרה לוי",
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

function mockAssessments(assessments: Assessment[], loading = false) {
  (useAssessmentsHook.useAssessments as jest.Mock).mockReturnValue({
    assessments,
    loading,
    cloudError: null,
    syncing: false,
    refresh: jest.fn(),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AssessmentSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the sidebar heading", () => {
    mockAssessments([]);
    render(<AssessmentSidebar />);
    expect(screen.getByText("הערכות")).toBeInTheDocument();
  });

  it("renders skeleton rows while loading", () => {
    mockAssessments([], true);
    render(<AssessmentSidebar />);
    // aria-busy is set on the skeleton list
    const skeletonList = screen.getByRole("list", { name: "טוען הערכות" });
    expect(skeletonList).toHaveAttribute("aria-busy", "true");
  });

  it("shows empty-state message when no assessments exist", () => {
    mockAssessments([]);
    render(<AssessmentSidebar />);
    expect(screen.getByText("אין הערכות עדיין")).toBeInTheDocument();
  });

  it("renders assessment items from useAssessments", () => {
    const a1 = makeAssessment({ id: "a1", identification: { patientName: "דנה כץ", assessmentDate: "01/01/2026", assessmentTools: [], examiner: "", referralReason: "" } });
    const a2 = makeAssessment({ id: "a2", identification: { patientName: "יוסי ביטון", assessmentDate: "02/02/2026", assessmentTools: [], examiner: "", referralReason: "" } });
    mockAssessments([a1, a2]);
    render(<AssessmentSidebar />);
    expect(screen.getByText("דנה כץ")).toBeInTheDocument();
    expect(screen.getByText("יוסי ביטון")).toBeInTheDocument();
  });

  it("marks the active assessment with aria-current='page'", () => {
    const a1 = makeAssessment({ id: "a1" });
    const a2 = makeAssessment({ id: "a2", identification: { patientName: "אחמד נסר", assessmentDate: "10/10/2026", assessmentTools: [], examiner: "", referralReason: "" } });
    mockAssessments([a1, a2]);
    render(<AssessmentSidebar activeId="a1" />);

    const buttons = screen.getAllByRole("button");
    // Find the navigation button for assessment a1
    const activeBtn = buttons.find(
      (btn) => btn.getAttribute("aria-current") === "page"
    );
    expect(activeBtn).toBeDefined();
    // The inactive one should not have aria-current
    const inactiveBtn = buttons.find(
      (btn) =>
        btn.textContent?.includes("אחמד נסר") &&
        !btn.getAttribute("aria-current")
    );
    expect(inactiveBtn).toBeDefined();
  });

  it("navigates to /assessment/[id] when an assessment is clicked", () => {
    const a = makeAssessment({ id: "nav-test-id" });
    mockAssessments([a]);
    render(<AssessmentSidebar />);

    // Click the assessment button (it includes patient name)
    fireEvent.click(screen.getByText("שרה לוי"));
    expect(mockPush).toHaveBeenCalledWith("/assessment/nav-test-id");
  });

  it("renders 'הערכה חדשה' button when onNewAssessment is provided", () => {
    mockAssessments([]);
    const onNew = jest.fn();
    render(<AssessmentSidebar onNewAssessment={onNew} />);
    expect(screen.getByRole("button", { name: /הערכה חדשה/ })).toBeInTheDocument();
  });

  it("calls onNewAssessment when 'הערכה חדשה' is clicked", () => {
    mockAssessments([]);
    const onNew = jest.fn();
    render(<AssessmentSidebar onNewAssessment={onNew} />);
    fireEvent.click(screen.getByRole("button", { name: /הערכה חדשה/ }));
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it("does not render 'הערכה חדשה' button when onNewAssessment is not provided", () => {
    mockAssessments([]);
    render(<AssessmentSidebar />);
    expect(
      screen.queryByRole("button", { name: /הערכה חדשה/ })
    ).not.toBeInTheDocument();
  });

  it("shows status badge for each assessment", () => {
    const a1 = makeAssessment({ id: "a1", status: "in_progress" });
    const a2 = makeAssessment({ id: "a2", status: "completed", identification: { patientName: "יעל שמיר", assessmentDate: "05/05/2026", assessmentTools: [], examiner: "", referralReason: "" } });
    mockAssessments([a1, a2]);
    render(<AssessmentSidebar />);
    expect(screen.getByText("בתהליך")).toBeInTheDocument();
    expect(screen.getByText("הושלם")).toBeInTheDocument();
  });

  it("includes patient name, date, and status in the aria-label", () => {
    const a = makeAssessment();
    mockAssessments([a]);
    render(<AssessmentSidebar />);
    const btn = screen.getByRole("button", { name: /שרה לוי/ });
    const label = btn.getAttribute("aria-label") || "";
    expect(label).toContain("שרה לוי");
    expect(label).toContain("18/03/2026");
    expect(label).toContain("בתהליך");
  });
});
