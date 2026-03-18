import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../Modal";

// ---------------------------------------------------------------------------
// Helper wrapper that controls open state
// ---------------------------------------------------------------------------

function TestModal({
  defaultOpen = true,
  title,
  disableBackdropClose,
}: {
  defaultOpen?: boolean;
  title?: string;
  disableBackdropClose?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <button onClick={() => setOpen(true)}>פתח</button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        disableBackdropClose={disableBackdropClose}
      >
        <p>תוכן מודל</p>
        <button onClick={() => setOpen(false)}>סגור</button>
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(<TestModal defaultOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(<TestModal />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<TestModal title="כותרת" />);
    expect(screen.getByText("כותרת")).toBeInTheDocument();
  });

  it("does not render title header when title prop is omitted", () => {
    render(<TestModal />);
    // The ✕ close button in the header should not be present
    expect(screen.queryByLabelText("סגור")).not.toBeInTheDocument();
  });

  it("closes when close button (✕) is clicked", () => {
    render(<TestModal title="מודל" />);
    fireEvent.click(screen.getByLabelText("סגור"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when Escape key is pressed", () => {
    render(<TestModal title="מודל" />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when backdrop is clicked", () => {
    render(<TestModal title="מודל" />);
    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not close when backdrop click is disabled", () => {
    render(<TestModal title="מודל" disableBackdropClose />);
    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);
    // Dialog still open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has aria-modal attribute", () => {
    render(<TestModal />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("has aria-labelledby when title provided", () => {
    render(<TestModal title="כותרת" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
  });

  it("renders children content", () => {
    render(<TestModal />);
    expect(screen.getByText("תוכן מודל")).toBeInTheDocument();
  });

  it("re-opens when trigger button is clicked", () => {
    render(<TestModal defaultOpen={false} title="מודל" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("פתח"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
