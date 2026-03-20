/**
 * Unit tests for EditAssessmentModal component.
 *
 * We test:
 *  - Renders modal with Hebrew labels and title
 *  - Prepopulates fields with existing assessment data
 *  - Shows validation error when submitting with empty name
 *  - Closes on Escape key
 *  - Calls onClose when backdrop is clicked
 *  - Calls onClose when close button is clicked
 *  - Calls onSave and onClose with updated assessment on valid submit
 *  - Trims whitespace from patient name before saving
 *  - Does not save when updateAssessment returns null
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditAssessmentModal from "../EditAssessmentModal";
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

function makeUpdatedAssessment(): Assessment {
  return {
    ...makeAssessment(),
    updatedAt: "2026-03-20T10:00:00.000Z",
    syncStatus: "pending",
    identification: {
      patientName: "שם חדש",
      assessmentDate: "20/03/2026",
      assessmentTools: [],
      examiner: "",
      referralReason: "",
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EditAssessmentModal", () => {
  const onSave = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (localStorageLib.updateAssessment as jest.Mock).mockReturnValue(
      makeUpdatedAssessment()
    );
  });

  it("renders the modal with Hebrew heading", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("עריכת פרטי הערכה")).toBeInTheDocument();
  });

  it("renders patient name label in Hebrew", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    expect(screen.getByLabelText(/שם המטופל/)).toBeInTheDocument();
  });

  it("renders assessment date label in Hebrew", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    expect(screen.getByLabelText("תאריך הערכה")).toBeInTheDocument();
  });

  it("prepopulates patient name from existing assessment", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    const input = screen.getByLabelText(/שם המטופל/) as HTMLInputElement;
    expect(input.value).toBe("אחמד כהן");
  });

  it("prepopulates assessment date from existing assessment (converted to ISO for input)", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    const input = screen.getByLabelText("תאריך הערכה") as HTMLInputElement;
    expect(input.value).toBe("2026-03-18");
  });

  it("renders save button with Hebrew label", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    expect(screen.getByRole("button", { name: "שמור שינויים" })).toBeInTheDocument();
  });

  it("shows validation error when submitting with empty patient name", async () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "שמור שינויים" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("יש להזין שם מטופל");
  });

  it("does not save when patient name is empty", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "שמור שינויים" }));
    expect(localStorageLib.updateAssessment).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("clears validation error when user starts typing", async () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "שמור שינויים" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "א" },
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "סגור" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls updateAssessment, onSave, and onClose on valid submit", async () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );

    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "שם חדש" },
    });
    fireEvent.change(screen.getByLabelText("תאריך הערכה"), {
      target: { value: "2026-03-20" },
    });

    fireEvent.click(screen.getByRole("button", { name: "שמור שינויים" }));

    await waitFor(() => {
      expect(localStorageLib.updateAssessment).toHaveBeenCalledTimes(1);
    });

    // Verify the call arguments
    const callArgs = (localStorageLib.updateAssessment as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBe("test-id-123");
    expect(callArgs[1].identification.patientName).toBe("שם חדש");
    expect(callArgs[1].identification.assessmentDate).toBe("20/03/2026");
    expect(callArgs[1].syncStatus).toBe("pending");

    expect(onSave).toHaveBeenCalledWith(makeUpdatedAssessment());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("trims whitespace from patient name before saving", async () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );

    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "  שם חדש  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "שמור שינויים" }));

    await waitFor(() => {
      expect(localStorageLib.updateAssessment).toHaveBeenCalledTimes(1);
    });

    const callArgs = (localStorageLib.updateAssessment as jest.Mock).mock.calls[0];
    expect(callArgs[1].identification.patientName).toBe("שם חדש");
  });

  it("shows validation error for whitespace-only patient name", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );

    fireEvent.change(screen.getByLabelText(/שם המטופל/), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "שמור שינויים" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(localStorageLib.updateAssessment).not.toHaveBeenCalled();
  });

  it("calls onClose but not onSave when updateAssessment returns null", async () => {
    (localStorageLib.updateAssessment as jest.Mock).mockReturnValue(null);

    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "שמור שינויים" }));

    await waitFor(() => {
      expect(localStorageLib.updateAssessment).toHaveBeenCalledTimes(1);
    });

    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has aria-modal=true and aria-labelledby pointing to the title", () => {
    render(
      <EditAssessmentModal
        assessment={makeAssessment()}
        onSave={onSave}
        onClose={onClose}
      />
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "edit-assessment-title");
    expect(
      document.getElementById("edit-assessment-title")
    ).toHaveTextContent("עריכת פרטי הערכה");
  });
});
