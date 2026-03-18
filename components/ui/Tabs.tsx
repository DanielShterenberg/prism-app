/**
 * Tabs — accessible tab navigation component.
 *
 * Implements ARIA tabs pattern (role="tablist" / "tab" / "tabpanel").
 * Keyboard: Arrow keys navigate between tabs, Enter/Space selects.
 * RTL-aware — ArrowRight/Left swapped automatically.
 *
 * Usage:
 *   const [active, setActive] = useState("a");
 *   <Tabs
 *     tabs={[{ id: "a", label: "כרטיסייה א" }, { id: "b", label: "כרטיסייה ב" }]}
 *     activeTab={active}
 *     onTabChange={setActive}
 *   >
 *     {active === "a" && <div>תוכן א</div>}
 *     {active === "b" && <div>תוכן ב</div>}
 *   </Tabs>
 */

"use client";

import React, { useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TabItem {
  id: string;
  label: string;
  /** Optional badge count shown next to the label. */
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children?: React.ReactNode;
  /** Extra class on the root wrapper. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = "",
}: TabsProps) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      const enabledTabs = tabs.filter((t) => !t.disabled);
      const enabledIndex = enabledTabs.findIndex(
        (t) => t.id === tabs[currentIndex].id
      );

      // RTL: ArrowRight moves to previous (visually left in LTR, right in RTL)
      const isRTL = document.documentElement.dir === "rtl";
      const nextKey = isRTL ? "ArrowLeft" : "ArrowRight";
      const prevKey = isRTL ? "ArrowRight" : "ArrowLeft";

      let nextEnabledIndex = enabledIndex;

      if (e.key === nextKey) {
        nextEnabledIndex = (enabledIndex + 1) % enabledTabs.length;
      } else if (e.key === prevKey) {
        nextEnabledIndex =
          (enabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
      } else if (e.key === "Home") {
        nextEnabledIndex = 0;
      } else if (e.key === "End") {
        nextEnabledIndex = enabledTabs.length - 1;
      } else {
        return;
      }

      e.preventDefault();
      const targetTab = enabledTabs[nextEnabledIndex];
      onTabChange(targetTab.id);

      // Move focus to the new tab button
      const tabListEl = tabListRef.current;
      if (tabListEl) {
        const btn = tabListEl.querySelector<HTMLButtonElement>(
          `[data-tab-id="${targetTab.id}"]`
        );
        btn?.focus();
      }
    },
    [tabs, onTabChange]
  );

  return (
    <div className={["flex flex-col gap-0", className].join(" ")}>
      {/* Tab list */}
      <div
        ref={tabListRef}
        role="tablist"
        className={[
          "flex gap-1 overflow-x-auto",
          "border-b border-border",
          "pb-0 scrollbar-none",
        ].join(" ")}
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={isActive}
              disabled={tab.disabled}
              data-tab-id={tab.id}
              tabIndex={isActive ? 0 : -1}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={[
                "inline-flex items-center gap-1.5 px-4 py-3",
                "text-sm font-medium whitespace-nowrap",
                "border-b-2 -mb-px transition-colors duration-150",
                "min-h-[44px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground-muted hover:text-foreground hover:border-border-strong",
                tab.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={[
                    "text-xs font-semibold px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-primary-light text-primary"
                      : "bg-surface text-foreground-muted",
                  ].join(" ")}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`tabpanel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== activeTab}
          tabIndex={0}
          className="focus:outline-none"
        >
          {tab.id === activeTab && children}
        </div>
      ))}
    </div>
  );
}

export default Tabs;
