import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../Input";

describe("Input", () => {
  it("renders without label", () => {
    render(<Input placeholder="הכנס ערך" />);
    expect(screen.getByPlaceholderText("הכנס ערך")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Input label="שם מטופל" id="name" />);
    expect(screen.getByLabelText("שם מטופל")).toBeInTheDocument();
  });

  it("shows required asterisk in label", () => {
    render(<Input label="שם" id="name" required />);
    const label = screen.getByText(/שם/);
    expect(label).toBeInTheDocument();
    // Asterisk rendered as aria-hidden span
    const asterisk = document.querySelector('[aria-hidden="true"]');
    expect(asterisk?.textContent).toMatch(/\*/);
  });

  it("sets aria-required when required", () => {
    render(<Input label="שם" id="name" required />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
  });

  it("shows error message and sets aria-invalid", () => {
    render(<Input label="שם" id="name" error="שדה חובה" />);
    expect(screen.getByRole("alert")).toHaveTextContent("שדה חובה");
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows helper text when no error", () => {
    render(<Input label="שם" id="name" helperText="טקסט עזרה" />);
    expect(screen.getByText("טקסט עזרה")).toBeInTheDocument();
  });

  it("does not show helper text when error is present", () => {
    render(<Input label="שם" id="name" error="שגיאה" helperText="עזרה" />);
    expect(screen.queryByText("עזרה")).not.toBeInTheDocument();
    expect(screen.getByText("שגיאה")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = jest.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "טקסט" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is passed", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies error border class when error is present", () => {
    render(<Input error="שגיאה" />);
    expect(screen.getByRole("textbox").className).toMatch(/border-error/);
  });

  it("has font size ≥ 16px class (text-base) for iPad no-zoom", () => {
    render(<Input />);
    expect(screen.getByRole("textbox").className).toMatch(/text-base/);
  });
});
