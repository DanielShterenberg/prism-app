import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Textarea } from "../Textarea";

describe("Textarea", () => {
  it("renders without label", () => {
    render(<Textarea placeholder="הכנס טקסט" />);
    expect(screen.getByPlaceholderText("הכנס טקסט")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Textarea label="הערות" id="notes" />);
    expect(screen.getByLabelText("הערות")).toBeInTheDocument();
  });

  it("shows required asterisk", () => {
    render(<Textarea label="הערות" id="notes" required />);
    const asterisk = document.querySelector('[aria-hidden="true"]');
    expect(asterisk?.textContent).toMatch(/\*/);
  });

  it("sets aria-required when required", () => {
    render(<Textarea label="הערות" id="notes" required />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
  });

  it("shows error and sets aria-invalid", () => {
    render(<Textarea label="הערות" id="notes" error="שגיאה" />);
    expect(screen.getByRole("alert")).toHaveTextContent("שגיאה");
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows helper text when no error", () => {
    render(<Textarea helperText="טקסט עזרה" />);
    expect(screen.getByText("טקסט עזרה")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = jest.fn();
    render(<Textarea onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "שורה 1\nשורה 2" },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("has resize-none class (auto-expanding)", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox").className).toMatch(/resize-none/);
  });

  it("has overflow-hidden class (auto-expanding)", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox").className).toMatch(/overflow-hidden/);
  });

  it("has font size ≥ 16px class (text-base) for iPad no-zoom", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox").className).toMatch(/text-base/);
  });

  it("applies error border class when error is present", () => {
    render(<Textarea error="שגיאה" />);
    expect(screen.getByRole("textbox").className).toMatch(/border-error/);
  });
});
