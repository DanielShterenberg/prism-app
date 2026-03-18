import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>לחץ כאן</Button>);
    expect(screen.getByRole("button", { name: "לחץ כאן" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>לחץ</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>מושבת</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>מושבת</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows loading spinner and aria-busy when loading", () => {
    render(<Button loading>טוען</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
  });

  it("applies variant class — primary by default", () => {
    render(<Button>ראשי</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/bg-primary/);
  });

  it("applies secondary variant", () => {
    render(<Button variant="secondary">משני</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/border-primary/);
  });

  it("applies danger variant", () => {
    render(<Button variant="danger">מחק</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/bg-error/);
  });

  it("applies fullWidth class", () => {
    render(<Button fullWidth>רוחב מלא</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/w-full/);
  });

  it("applies size sm class", () => {
    render(<Button size="sm">קטן</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/text-sm/);
  });

  it("applies size lg class", () => {
    render(<Button size="lg">גדול</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/text-lg/);
  });

  it("merges custom className", () => {
    render(<Button className="custom-class">כפתור</Button>);
    expect(screen.getByRole("button").className).toMatch(/custom-class/);
  });
});
