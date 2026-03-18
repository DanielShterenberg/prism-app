import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabItem } from "../Tabs";

// ---------------------------------------------------------------------------
// Helper wrapper
// ---------------------------------------------------------------------------

const TABS: TabItem[] = [
  { id: "a", label: "לשונית א" },
  { id: "b", label: "לשונית ב" },
  { id: "c", label: "לשונית ג", disabled: true },
];

function TestTabs({ initialTab = "a" }: { initialTab?: string }) {
  const [active, setActive] = useState(initialTab);
  return (
    <Tabs tabs={TABS} activeTab={active} onTabChange={setActive}>
      <p>תוכן {active}</p>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders all tab buttons", () => {
    render(<TestTabs />);
    expect(screen.getByRole("tab", { name: "לשונית א" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "לשונית ב" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "לשונית ג" })).toBeInTheDocument();
  });

  it("marks active tab with aria-selected=true", () => {
    render(<TestTabs initialTab="a" />);
    expect(screen.getByRole("tab", { name: "לשונית א" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: "לשונית ב" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("renders tablist with role", () => {
    render(<TestTabs />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("calls onTabChange when a tab is clicked", () => {
    const onTabChange = jest.fn();
    render(
      <Tabs tabs={TABS} activeTab="a" onTabChange={onTabChange}>
        <p>תוכן</p>
      </Tabs>
    );
    fireEvent.click(screen.getByRole("tab", { name: "לשונית ב" }));
    expect(onTabChange).toHaveBeenCalledWith("b");
  });

  it("does not call onTabChange for disabled tab", () => {
    const onTabChange = jest.fn();
    render(
      <Tabs tabs={TABS} activeTab="a" onTabChange={onTabChange}>
        <p>תוכן</p>
      </Tabs>
    );
    fireEvent.click(screen.getByRole("tab", { name: "לשונית ג" }));
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it("shows tabpanel for active tab", () => {
    render(<TestTabs initialTab="a" />);
    expect(screen.getByRole("tabpanel")).toBeVisible();
    expect(screen.getByText("תוכן a")).toBeInTheDocument();
  });

  it("switches content when tab is clicked", () => {
    render(<TestTabs initialTab="a" />);
    expect(screen.getByText("תוכן a")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "לשונית ב" }));
    expect(screen.getByText("תוכן b")).toBeInTheDocument();
  });

  it("renders badge count when tab has count", () => {
    const tabsWithCount: TabItem[] = [
      { id: "x", label: "עם ספירה", count: 5 },
    ];
    render(
      <Tabs tabs={tabsWithCount} activeTab="x" onTabChange={() => {}}>
        <p>תוכן</p>
      </Tabs>
    );
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("tab has tabIndex=0 when active, -1 when not", () => {
    render(<TestTabs initialTab="a" />);
    expect(screen.getByRole("tab", { name: "לשונית א" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "לשונית ב" })).toHaveAttribute("tabindex", "-1");
  });

  it("each tab has aria-controls pointing to its tabpanel", () => {
    render(<TestTabs />);
    const tabA = screen.getByRole("tab", { name: "לשונית א" });
    const panelId = tabA.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).not.toBeNull();
  });
});
