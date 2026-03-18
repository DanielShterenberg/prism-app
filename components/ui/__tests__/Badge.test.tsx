import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>תגית</Badge>);
    expect(screen.getByText("תגית")).toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    render(<Badge>ברירת מחדל</Badge>);
    const badge = screen.getByText("ברירת מחדל");
    expect(badge.className).toMatch(/bg-surface/);
  });

  it("applies primary variant styles", () => {
    render(<Badge variant="primary">ראשי</Badge>);
    const badge = screen.getByText("ראשי");
    expect(badge.className).toMatch(/bg-primary-light/);
  });

  it("applies success variant styles", () => {
    render(<Badge variant="success">הושלם</Badge>);
    const badge = screen.getByText("הושלם");
    expect(badge.className).toMatch(/bg-success-light/);
  });

  it("applies warning variant styles", () => {
    render(<Badge variant="warning">ממתין</Badge>);
    const badge = screen.getByText("ממתין");
    expect(badge.className).toMatch(/bg-warning-light/);
  });

  it("applies error variant styles", () => {
    render(<Badge variant="error">שגיאה</Badge>);
    const badge = screen.getByText("שגיאה");
    expect(badge.className).toMatch(/bg-error-light/);
  });

  it("applies accent variant styles", () => {
    render(<Badge variant="accent">מבטאים</Badge>);
    const badge = screen.getByText("מבטאים");
    expect(badge.className).toMatch(/bg-accent-light/);
  });

  it("merges custom className", () => {
    render(<Badge className="custom">תגית</Badge>);
    expect(screen.getByText("תגית").className).toMatch(/custom/);
  });

  it("has rounded-full class", () => {
    render(<Badge>עגול</Badge>);
    expect(screen.getByText("עגול").className).toMatch(/rounded-full/);
  });
});
