import React from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "../Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>תוכן כרטיס</Card>);
    expect(screen.getByText("תוכן כרטיס")).toBeInTheDocument();
  });

  it("applies raised variant by default", () => {
    render(<Card>תוכן</Card>);
    const card = screen.getByText("תוכן").closest("div");
    expect(card?.className).toMatch(/shadow-md/);
  });

  it("applies flat variant", () => {
    render(<Card variant="flat">שטוח</Card>);
    const card = screen.getByText("שטוח").closest("div");
    expect(card?.className).toMatch(/bg-surface/);
    expect(card?.className).not.toMatch(/shadow/);
  });

  it("applies outlined variant", () => {
    render(<Card variant="outlined">מתאר</Card>);
    const card = screen.getByText("מתאר").closest("div");
    expect(card?.className).toMatch(/border/);
  });

  it("applies padding class when padded=true (default)", () => {
    render(<Card>פנים</Card>);
    const card = screen.getByText("פנים").closest("div");
    expect(card?.className).toMatch(/p-5/);
  });

  it("does not apply padding when padded=false", () => {
    render(<Card padded={false}>ללא ריפוד</Card>);
    const card = screen.getByText("ללא ריפוד").closest("div");
    expect(card?.className).not.toMatch(/p-5/);
  });

  it("has rounded-2xl class", () => {
    render(<Card>עגלות</Card>);
    const card = screen.getByText("עגלות").closest("div");
    expect(card?.className).toMatch(/rounded-2xl/);
  });

  it("merges custom className", () => {
    render(<Card className="custom-card">תוכן</Card>);
    const card = screen.getByText("תוכן").closest("div");
    expect(card?.className).toMatch(/custom-card/);
  });
});
