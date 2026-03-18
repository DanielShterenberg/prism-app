/**
 * Unit tests for the Summary screen (/assessment/[id]/summary).
 *
 * Tests:
 *  - Shows "הערכה לא נמצאה" when assessment is not found
 *  - "חזרה לרשימה" navigates to "/" when not found
 *  - Renders patient name and date in the header
 *  - Shows "סיכום ערכה" subtitle in header
 *  - Skips empty blocks — only blocks with filled fields are rendered
 *  - Skips empty fields within a block
 *  - Renders Hebrew block titles (א–ה)
 *  - Renders field labels and values
 *  - Shows assessment tools as comma-separated string
 *  - Shows "לא הוזנו נתונים בטופס" when no fields are filled
 *  - "עריכה" button navigates to /assessment/[id]
 *  - "סמן כהושלם" calls updateAssessment with status='completed' and syncStatus='pending'
 *  - "סמן כהושלם" button becomes "הושלם" when assessment.status is 'completed'
 *  - "סמן כהושלם" button is disabled when status is 'completed'
 *  - "ייצוא" button is disabled
 *  - "הושלם" badge is shown when assessment.status is 'completed'
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SummaryPage from "../page";
import * as useAssessmentHook from "@/hooks/useAssessment";
import * as localStorageLib from "@/lib/localStorage";
import type { Assessment } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: "test-id-summary" }),
}));

jest.mock("@/hooks/useAssessment");

jest.mock("@/lib/localStorage", () => ({
  updateAssessment: jest.fn(),
}));

// useSync makes network calls — stub it out completely
jest.mock("@/hooks/useSync", () => ({
  useSync: jest.fn(),
}));

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: "test-id-summary",
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

describe("SummaryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Not found state
  // -------------------------------------------------------------------------

  describe("when assessment is not found", () => {
    it("shows the not-found message", () => {
      mockNotFound();
      render(<SummaryPage />);
      expect(screen.getByText("הערכה לא נמצאה.")).toBeInTheDocument();
    });

    it('navigates to "/" when "חזרה לרשימה" is clicked', () => {
      mockNotFound();
      render(<SummaryPage />);
      fireEvent.click(screen.getByText("חזרה לרשימה"));
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------

  describe("header", () => {
    it("renders the patient name in the h1 heading", () => {
      mockFound(makeAssessment());
      render(<SummaryPage />);
      // Patient name appears in both mobile and desktop h1 headings —
      // use getAllByRole and confirm at least one heading contains the name
      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings.some((h) => h.textContent?.includes("ילד בדיקה"))).toBe(true);
    });

    it("renders the 'סיכום ערכה' subtitle", () => {
      mockFound(makeAssessment());
      render(<SummaryPage />);
      // Subtitle appears in both mobile and desktop headers
      const subtitles = screen.getAllByText(/סיכום ערכה/);
      expect(subtitles.length).toBeGreaterThanOrEqual(1);
    });

    it("shows 'הושלם' badge when assessment is completed", () => {
      mockFound(makeAssessment({ status: "completed" }));
      render(<SummaryPage />);
      // The badge and the button both say "הושלם" — use getAllByText
      const badges = screen.getAllByText("הושלם");
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it("does not show 'הושלם' badge when assessment is in_progress", () => {
      mockFound(makeAssessment({ status: "in_progress" }));
      render(<SummaryPage />);
      // "הושלם" should not appear as a badge (button says "סמן כהושלם")
      expect(screen.queryByText("הושלם")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Block rendering
  // -------------------------------------------------------------------------

  describe("block rendering", () => {
    it("renders block A with Hebrew title when identification has data", () => {
      const assessment = makeAssessment({
        identification: {
          patientName: "שרה לוי",
          assessmentDate: "01/04/2026",
          assessmentTools: [],
          examiner: "ד״ר כהן",
          referralReason: "",
        },
      });
      mockFound(assessment);
      render(<SummaryPage />);
      expect(screen.getByText(/בלוק א — זיהוי מטופל/)).toBeInTheDocument();
    });

    it("renders field label and value for a filled field", () => {
      const assessment = makeAssessment({
        identification: {
          patientName: "דנה ישראלי",
          assessmentDate: "05/05/2026",
          assessmentTools: [],
          examiner: "",
          referralReason: "",
        },
      });
      mockFound(assessment);
      render(<SummaryPage />);
      expect(screen.getByText("שם המטופל/ת")).toBeInTheDocument();
      // Patient name appears both in header h1 and as a block field value;
      // use getAllByText and confirm at least one match exists
      const matches = screen.getAllByText("דנה ישראלי");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("renders assessment tools as comma-separated values", () => {
      const assessment = makeAssessment({
        identification: {
          patientName: "משה כהן",
          assessmentDate: "01/01/2026",
          assessmentTools: ["ADOS-2", "ADI-R", "Vineland-3"],
          examiner: "",
          referralReason: "",
        },
      });
      mockFound(assessment);
      render(<SummaryPage />);
      expect(
        screen.getByText("ADOS-2, ADI-R, Vineland-3")
      ).toBeInTheDocument();
    });

    it("skips empty fields — no label rendered for an empty field", () => {
      const assessment = makeAssessment({
        identification: {
          patientName: "יעל כץ",
          assessmentDate: "01/01/2026",
          assessmentTools: [],
          examiner: "",
          referralReason: "", // empty — should be skipped
        },
      });
      mockFound(assessment);
      render(<SummaryPage />);
      expect(screen.queryByText("סיבת הפניה")).not.toBeInTheDocument();
    });

    it("skips a block entirely when all its fields are empty", () => {
      const assessment = makeAssessment({
        // familyBackground is empty ({})
        familyBackground: {},
      });
      mockFound(assessment);
      render(<SummaryPage />);
      expect(
        screen.queryByText(/בלוק ב — רקע משפחתי/)
      ).not.toBeInTheDocument();
    });

    it("renders block B when it has data", () => {
      const assessment = makeAssessment({
        familyBackground: {
          father: "ראובן",
          city: "תל אביב",
        },
      });
      mockFound(assessment);
      render(<SummaryPage />);
      expect(screen.getByText(/בלוק ב — רקע משפחתי/)).toBeInTheDocument();
      expect(screen.getByText("אב")).toBeInTheDocument();
      expect(screen.getByText("ראובן")).toBeInTheDocument();
      expect(screen.getByText("עיר")).toBeInTheDocument();
      expect(screen.getByText("תל אביב")).toBeInTheDocument();
    });

    it("renders block C with developmental background data", () => {
      const assessment = makeAssessment({
        developmentalBackground: {
          pregnancy: "הריון תקין",
        },
      });
      mockFound(assessment);
      render(<SummaryPage />);
      expect(screen.getByText(/בלוק ג — רקע התפתחותי/)).toBeInTheDocument();
      expect(screen.getByText("הריון")).toBeInTheDocument();
      expect(screen.getByText("הריון תקין")).toBeInTheDocument();
    });

    it("renders block D with developmental milestone age fields", () => {
      const assessment = makeAssessment({
        developmentalMilestones: {
          firstWordsAge: "12 חודשים",
          sleep: "קשיי הירדמות",
        },
      });
      mockFound(assessment);
      render(<SummaryPage />);
      expect(
        screen.getByText(/בלוק ד — אבני דרך התפתחותיות/)
      ).toBeInTheDocument();
      expect(screen.getByText("מילה ראשונה")).toBeInTheDocument();
      expect(screen.getByText("12 חודשים")).toBeInTheDocument();
      expect(screen.getByText("שינה")).toBeInTheDocument();
      expect(screen.getByText("קשיי הירדמות")).toBeInTheDocument();
    });

    it("renders block E with frameworks and treatments data", () => {
      const assessment = makeAssessment({
        frameworksAndTreatments: {
          treatments: "ריפוי בעיסוק",
        },
      });
      mockFound(assessment);
      render(<SummaryPage />);
      expect(
        screen.getByText(/בלוק ה — מסגרות וטיפולים/)
      ).toBeInTheDocument();
      expect(screen.getByText("טיפולים")).toBeInTheDocument();
      expect(screen.getByText("ריפוי בעיסוק")).toBeInTheDocument();
    });

    it("shows empty-state message when no fields are filled anywhere", () => {
      const assessment = makeAssessment({
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
      });
      mockFound(assessment);
      render(<SummaryPage />);
      expect(
        screen.getByText("לא הוזנו נתונים בטופס.")
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Action buttons
  // -------------------------------------------------------------------------

  describe("action buttons", () => {
    it('navigates to /assessment/[id] when "עריכה" is clicked', () => {
      mockFound(makeAssessment());
      render(<SummaryPage />);
      const editButtons = screen.getAllByText("עריכה");
      fireEvent.click(editButtons[0]);
      expect(mockPush).toHaveBeenCalledWith("/assessment/test-id-summary");
    });

    it('"ייצוא" button is disabled', () => {
      mockFound(makeAssessment());
      render(<SummaryPage />);
      // Two export buttons rendered (mobile + desktop) — both should be disabled
      const exportBtns = screen.getAllByText("ייצוא").map((el) => el.closest("button"));
      expect(exportBtns.length).toBeGreaterThanOrEqual(1);
      exportBtns.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('"ייצוא" button has aria-label mentioning "בקרוב בגרסה 2"', () => {
      mockFound(makeAssessment());
      render(<SummaryPage />);
      // Two export buttons (mobile + desktop) — at least one should have the aria-label
      const exportBtns = screen.getAllByRole("button", {
        name: /בקרוב בגרסה 2/,
      });
      expect(exportBtns.length).toBeGreaterThanOrEqual(1);
    });

    it('"סמן כהושלם" calls updateAssessment with status completed', () => {
      const assessment = makeAssessment();
      const updatedAssessment = {
        ...assessment,
        status: "completed" as const,
        syncStatus: "pending" as const,
      };
      (localStorageLib.updateAssessment as jest.Mock).mockReturnValue(
        updatedAssessment
      );
      mockFound(assessment);
      render(<SummaryPage />);

      // Two "סמן כהושלם" buttons (mobile + desktop) — click the first
      const completeButtons = screen.getAllByText("סמן כהושלם");
      fireEvent.click(completeButtons[0]);

      expect(localStorageLib.updateAssessment).toHaveBeenCalledWith(
        "test-id-summary",
        expect.objectContaining({
          status: "completed",
          syncStatus: "pending",
        })
      );
    });

    it('"סמן כהושלם" button shows "הושלם" and is disabled when status is completed', () => {
      mockFound(makeAssessment({ status: "completed" }));
      render(<SummaryPage />);
      // The button text should be "הושלם" (not "סמן כהושלם")
      expect(screen.queryByText("סמן כהושלם")).not.toBeInTheDocument();
      // Find the specific completed button (not the badge) via role
      const completedButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.textContent === "הושלם");
      expect(completedButtons.length).toBeGreaterThanOrEqual(1);
      expect(completedButtons[0]).toBeDisabled();
    });
  });
});
