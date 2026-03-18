/**
 * BlockTabBar — horizontal scrollable tab bar for the 5 anamnesis blocks.
 *
 * Each tab shows:
 *  - Block letter (A–E) + Hebrew label
 *  - A checkmark icon when the block is completed
 *  - An active underline indicator for the selected block
 *
 * Layout: RTL inherited from root <html dir="rtl">.
 * Touch targets ≥ 44px.
 *
 * Landscape mode (iPad):
 * The nav has overflow-x-auto + scrollbar-none so all 5 tabs remain
 * accessible in narrow landscape viewports without a visible scrollbar.
 * The active tab is scrolled into view automatically when it changes.
 */

import React, { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BlockId = "A" | "B" | "C" | "D" | "E";

export interface BlockDefinition {
  id: BlockId;
  label: string;
}

export interface BlockTabBarProps {
  /** The currently active block */
  activeBlock: BlockId;
  /** Set of block IDs that have been completed (show checkmark) */
  completedBlocks: Set<BlockId>;
  /** Called when a tab is pressed */
  onSelectBlock: (id: BlockId) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BLOCKS: BlockDefinition[] = [
  { id: "A", label: "זיהוי" },
  { id: "B", label: "משפחה" },
  { id: "C", label: "התפתחות" },
  { id: "D", label: "אבני דרך" },
  { id: "E", label: "מסגרות" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BlockTabBar({
  activeBlock,
  completedBlocks,
  onSelectBlock,
}: BlockTabBarProps) {
  // Ref map so we can scroll the active tab button into view when it changes.
  // This ensures the active tab is visible in landscape mode where the tab
  // strip may be wider than the viewport.
  const tabRefs = useRef<Partial<Record<BlockId, HTMLButtonElement>>>({});

  useEffect(() => {
    const activeEl = tabRefs.current[activeBlock];
    if (activeEl) {
      activeEl.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeBlock]);

  return (
    <nav
      aria-label="בלוקי הערכה"
      className="w-full overflow-x-auto scrollbar-none border-b border-gray-200 bg-white"
    >
      <ul
        role="tablist"
        className="flex min-w-max"
      >
        {BLOCKS.map((block) => {
          const isActive = block.id === activeBlock;
          const isCompleted = completedBlocks.has(block.id);

          return (
            <li key={block.id} role="none" className="flex-shrink-0">
              <button
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-label={`בלוק ${block.id} — ${block.label}${isCompleted ? " (הושלם)" : ""}`}
                onClick={() => onSelectBlock(block.id)}
                ref={(el) => {
                  if (el) tabRefs.current[block.id] = el;
                }}
                className={[
                  // Layout — min 44 px touch target height
                  "relative flex flex-col items-center justify-center gap-0.5",
                  "px-4 pt-3 pb-2 min-h-[56px] min-w-[72px]",
                  // Typography
                  "text-xs font-medium leading-tight",
                  // Active vs inactive colour
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-800",
                  // Focus
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
                  "transition-colors duration-150",
                ].join(" ")}
              >
                {/* Block letter + checkmark row */}
                <span className="flex items-center gap-1">
                  <span className="text-[15px] font-bold">
                    {block.id}
                  </span>
                  {isCompleted && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 12 12"
                      className="w-3.5 h-3.5 text-green-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="1.5,6 4.5,9 10.5,3" />
                    </svg>
                  )}
                </span>

                {/* Hebrew block label */}
                <span className="text-[12px]">{block.label}</span>

                {/* Active indicator underline */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-t"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BlockTabBar;
