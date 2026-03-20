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

// AssessmentSidebar (rendered on desktop) uses useAssessments — stub it out
// to prevent it from calling listAssessments / fetch in the test environment.
jest.mock("@/hooks/useAssessments", () => ({
  useAssessments: () => ({
    assessments: [],
    loading: false,
    cloudError: null,
    syncing: false,
    refresh: jest.fn(),
  }),
}));

// useSync triggers network calls — stub it out.
jest.mock("@/hooks/useSync", () => ({
  useSync: jest.fn(),
}));

// EditAssessmentModal — stub with a simple dialog so we can test open/close.
jest.mock("@/components/EditAssessmentModal", () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" aria-label="edit-modal-stub">
      <button type="button" onClick={onClose}>סגור מודל</button>
    </div>
  ),
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
    // Patient name appears in both mobile and desktop headers
    const headings = screen.getAllByText("אחמד כהן");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders assessment date in the header", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    // Date appears in both mobile and desktop headers
    const dates = screen.getAllByText("18/03/2026");
    expect(dates.length).toBeGreaterThanOrEqual(1);
  });

  it("renders all 5 block tabs", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    // Two BlockTabBar instances (mobile + desktop) — use getAllByRole
    expect(screen.getAllByRole("tab", { name: /בלוק A/ }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("tab", { name: /בלוק B/ }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("tab", { name: /בלוק C/ }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("tab", { name: /בלוק D/ }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("tab", { name: /בלוק E/ }).length).toBeGreaterThanOrEqual(1);
  });

  it("sets block A as active by default", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    // At least one tab A is active
    const tabsA = screen.getAllByRole("tab", { name: /בלוק A/ });
    expect(tabsA.some((t) => t.getAttribute("aria-selected") === "true")).toBe(true);
  });

  it("switches active block when a tab is clicked", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);

    // Click the first tab C (mobile)
    const tabsC = screen.getAllByRole("tab", { name: /בלוק C/ });
    fireEvent.click(tabsC[0]);

    const updatedTabsC = screen.getAllByRole("tab", { name: /בלוק C/ });
    expect(updatedTabsC.some((t) => t.getAttribute("aria-selected") === "true")).toBe(true);

    const updatedTabsA = screen.getAllByRole("tab", { name: /בלוק A/ });
    expect(updatedTabsA.every((t) => t.getAttribute("aria-selected") === "false")).toBe(true);
  });

  it("renders the סיום finish button", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    const finishBtns = screen.getAllByRole("button", { name: "סיום" });
    expect(finishBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("navigates to /assessment/[id]/summary when סיום is clicked", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    const finishBtns = screen.getAllByRole("button", { name: "סיום" });
    fireEvent.click(finishBtns[0]);
    expect(mockPush).toHaveBeenCalledWith("/assessment/test-id-123/summary");
  });

  it("shows completed checkmark in aria-label for blocks with data", () => {
    // familyBackground has data → block B is completed
    mockFound(makeAssessment({ familyBackground: { father: "אבי" } }));
    render(<AssessmentPage />);

    const completedTabs = screen.getAllByRole("tab", { name: /בלוק B.*הושלם/ });
    expect(completedTabs.length).toBeGreaterThanOrEqual(1);
  });

  it("does not show completed checkmark for blocks without data", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);

    // B, C, D, E all have empty data — none should have הושלם
    for (const blockId of ["B", "C", "D", "E"]) {
      const tabs = screen.getAllByRole("tab", { name: new RegExp(`בלוק ${blockId}`) });
      tabs.forEach((tab) => {
        expect(tab.getAttribute("aria-label")).not.toContain("הושלם");
      });
    }
  });

  it("renders back-to-list button in the header", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    const btns = screen.getAllByRole("button", { name: "חזרה לרשימה" });
    expect(btns.length).toBeGreaterThanOrEqual(1);
  });

  it("navigates to '/' when the header back button is clicked", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    const btns = screen.getAllByRole("button", { name: "חזרה לרשימה" });
    fireEvent.click(btns[0]);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("renders the edit button in the header", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    const editBtns = screen.getAllByRole("button", { name: "עריכת פרטי הערכה" });
    expect(editBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("opens the edit modal when the edit button is clicked", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);
    // Initially, the edit modal is not visible
    expect(screen.queryByRole("dialog", { name: "edit-modal-stub" })).not.toBeInTheDocument();

    const editBtns = screen.getAllByRole("button", { name: "עריכת פרטי הערכה" });
    fireEvent.click(editBtns[0]);

    expect(screen.getByRole("dialog", { name: "edit-modal-stub" })).toBeInTheDocument();
  });

  it("closes the edit modal when its onClose is called", () => {
    mockFound(makeAssessment());
    render(<AssessmentPage />);

    const editBtns = screen.getAllByRole("button", { name: "עריכת פרטי הערכה" });
    fireEvent.click(editBtns[0]);
    expect(screen.getByRole("dialog", { name: "edit-modal-stub" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "סגור מודל" }));
    expect(screen.queryByRole("dialog", { name: "edit-modal-stub" })).not.toBeInTheDocument();
  });
});
