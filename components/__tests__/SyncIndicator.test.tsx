/**
 * Unit tests for SyncIndicator
 *
 * Covers:
 * - Renders correct label for each sync state
 * - synced / pending states render as <span role="status"> (non-interactive)
 * - error state without onRetry renders as <span role="status"> (non-interactive)
 * - error state with onRetry renders as a tappable button
 * - Tapping the error button opens the popover
 * - Retry popover contains the error message and "נסה שוב" button
 * - Clicking retry calls onRetry and closes the popover
 * - Clicking outside the popover closes it
 * - Pressing Escape closes the popover
 * - Popover auto-closes when syncStatus changes from error to another state
 */

import React, { useState } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SyncIndicator } from "@/components/SyncIndicator";
import type { SyncStatus } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderIndicator(
  syncStatus: SyncStatus,
  onRetry?: () => void
) {
  return render(
    <SyncIndicator syncStatus={syncStatus} onRetry={onRetry} />
  );
}

// A wrapper that allows toggling syncStatus from outside to test auto-close
function ControlledIndicator({
  initialStatus,
  onRetry,
}: {
  initialStatus: SyncStatus;
  onRetry: () => void;
}) {
  const [status, setStatus] = useState<SyncStatus>(initialStatus);
  return (
    <>
      <SyncIndicator syncStatus={status} onRetry={onRetry} />
      <button type="button" onClick={() => setStatus("pending")}>
        set-pending
      </button>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tests: non-interactive states
// ---------------------------------------------------------------------------

describe("SyncIndicator — non-interactive states", () => {
  it("renders 'נשמר ✓' for synced status", () => {
    renderIndicator("synced");
    expect(screen.getByRole("status")).toHaveTextContent("נשמר ✓");
  });

  it("renders 'מסנכרן...' for pending status", () => {
    renderIndicator("pending");
    expect(screen.getByRole("status")).toHaveTextContent("מסנכרן...");
  });

  it("renders a span (not a button) for synced even with onRetry", () => {
    renderIndicator("synced", jest.fn());
    // synced is non-interactive — should be a span with role=status
    const el = screen.getByRole("status");
    expect(el.tagName).toBe("SPAN");
  });

  it("renders a span (not a button) for error without onRetry", () => {
    renderIndicator("error");
    const el = screen.getByRole("status");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveTextContent("שמור מקומית בלבד");
  });
});

// ---------------------------------------------------------------------------
// Tests: error state — button behaviour
// ---------------------------------------------------------------------------

describe("SyncIndicator — error state with onRetry", () => {
  it("renders a button for error status when onRetry is provided", () => {
    renderIndicator("error", jest.fn());
    const btn = screen.getByRole("button", { name: /שגיאת סנכרון/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent("שמור מקומית בלבד");
  });

  it("does not show the popover initially", () => {
    renderIndicator("error", jest.fn());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the popover when the error button is clicked", () => {
    renderIndicator("error", jest.fn());
    fireEvent.click(screen.getByRole("button", { name: /שגיאת סנכרון/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("popover contains the error message", () => {
    renderIndicator("error", jest.fn());
    fireEvent.click(screen.getByRole("button", { name: /שגיאת סנכרון/i }));
    expect(
      screen.getByText("שמור מקומית בלבד — לחץ לנסות שוב")
    ).toBeInTheDocument();
  });

  it("popover contains the retry button", () => {
    renderIndicator("error", jest.fn());
    fireEvent.click(screen.getByRole("button", { name: /שגיאת סנכרון/i }));
    expect(screen.getByRole("button", { name: "נסה שוב" })).toBeInTheDocument();
  });

  it("calls onRetry when the retry button is clicked", () => {
    const onRetry = jest.fn();
    renderIndicator("error", onRetry);
    fireEvent.click(screen.getByRole("button", { name: /שגיאת סנכרון/i }));
    fireEvent.click(screen.getByRole("button", { name: "נסה שוב" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("closes the popover after retry button is clicked", () => {
    renderIndicator("error", jest.fn());
    fireEvent.click(screen.getByRole("button", { name: /שגיאת סנכרון/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "נסה שוב" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles the popover closed when error button clicked again", () => {
    renderIndicator("error", jest.fn());
    const btn = screen.getByRole("button", { name: /שגיאת סנכרון/i });
    fireEvent.click(btn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the popover on Escape key", () => {
    renderIndicator("error", jest.fn());
    fireEvent.click(screen.getByRole("button", { name: /שגיאת סנכרון/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the popover on outside click", () => {
    render(
      <div>
        <SyncIndicator syncStatus="error" onRetry={jest.fn()} />
        <button type="button">outside</button>
      </div>
    );

    fireEvent.click(screen.getByRole("button", { name: /שגיאת סנכרון/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Simulate a pointerdown event on an outside element
    fireEvent.pointerDown(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("auto-closes the popover when syncStatus changes from error to pending", () => {
    render(<ControlledIndicator initialStatus="error" onRetry={jest.fn()} />);

    // Open the popover
    fireEvent.click(screen.getByRole("button", { name: /שגיאת סנכרון/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Simulate a successful sync — status changes to pending
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "set-pending" }));
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
