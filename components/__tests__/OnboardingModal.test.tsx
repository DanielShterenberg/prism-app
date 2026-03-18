/**
 * Unit tests for OnboardingModal component.
 *
 * Tests:
 *  - Modal is shown when prism:onboarding_complete is NOT in localStorage
 *  - Modal is NOT shown when prism:onboarding_complete IS in localStorage
 *  - Renders the privacy disclaimer text in Hebrew
 *  - Renders the "הבנתי, המשך" button
 *  - Clicking the button sets the localStorage flag and closes the modal
 *  - Backdrop click does NOT close the modal (disableBackdropClose)
 *  - RTL layout — dialog is present and content is in Hebrew
 */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import OnboardingModal, { ONBOARDING_KEY } from "../OnboardingModal";

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("OnboardingModal", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it("shows the modal when onboarding_complete flag is absent", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<OnboardingModal />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not show the modal when onboarding_complete flag is set", () => {
    localStorageMock.getItem.mockReturnValue("1");
    render(<OnboardingModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the Hebrew privacy disclaimer text", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<OnboardingModal />);
    expect(
      screen.getByText(
        /Prism שומר את הנתונים שלך בצורה מאובטחת לענן\. הנתונים מוצפנים בזמן/
      )
    ).toBeInTheDocument();
  });

  it("renders the 'הבנתי, המשך' confirm button", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<OnboardingModal />);
    expect(
      screen.getByRole("button", { name: "הבנתי, המשך" })
    ).toBeInTheDocument();
  });

  it("renders the modal title 'פרטיות ואבטחה'", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<OnboardingModal />);
    expect(screen.getByText("פרטיות ואבטחה")).toBeInTheDocument();
  });

  it("closes the modal and sets localStorage flag when confirm button is clicked", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<OnboardingModal />);

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "הבנתי, המשך" }));
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(ONBOARDING_KEY, "1");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not close when backdrop is clicked", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<OnboardingModal />);

    // Clicking the dialog overlay element directly should NOT close the modal
    // because disableBackdropClose is set to true.
    fireEvent.click(screen.getByRole("dialog"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("has aria-modal attribute on the dialog", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<OnboardingModal />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("ONBOARDING_KEY constant equals 'prism:onboarding_complete'", () => {
    expect(ONBOARDING_KEY).toBe("prism:onboarding_complete");
  });
});
