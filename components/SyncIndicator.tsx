/**
 * SyncIndicator — subtle status badge showing the current cloud sync state.
 *
 * Displays one of three states:
 *   synced  → "נשמר ✓"           (green)
 *   pending → "מסנכרן..."         (amber, animated)
 *   error   → "שמור מקומית בלבד" (red, tappable — opens retry popover)
 *
 * When syncStatus === 'error' and onRetry is provided, the indicator is
 * rendered as a button. Tapping it opens an inline popover with:
 *   - The error message: "שמור מקומית בלבד — לחץ לנסות שוב"
 *   - A "נסה שוב" retry button that calls onRetry and closes the popover
 *
 * The popover dismisses when:
 *   - The retry button is clicked
 *   - The user clicks/taps outside the popover
 *   - The Escape key is pressed
 *   - syncStatus changes away from 'error' (auto-closed via derived state)
 *
 * All text is Hebrew.  Touch targets are ≥ 44 px on all interactive elements.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { SyncStatus } from "@/types/assessment";

export interface SyncIndicatorProps {
  syncStatus: SyncStatus;
  /**
   * Callback invoked when the user presses the retry button.
   * When provided and syncStatus === 'error', the indicator becomes tappable.
   */
  onRetry?: () => void;
  /** Optional extra className applied to the root element. */
  className?: string;
}

const LABEL: Record<SyncStatus, string> = {
  synced: "נשמר ✓",
  pending: "מסנכרן...",
  error: "שמור מקומית בלבד",
};

const STYLE: Record<SyncStatus, string> = {
  synced: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800 animate-pulse",
  error: "bg-red-100 text-red-700",
};

export function SyncIndicator({
  syncStatus,
  onRetry,
  className = "",
}: SyncIndicatorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive visibility: the popover is visible only when the user has opened
  // it AND syncStatus is still 'error'. This means it auto-closes as soon as
  // a successful retry updates syncStatus — no additional effect needed.
  const isPopoverVisible = popoverOpen && syncStatus === "error";

  // Close on outside click — only active while the popover is visible
  useEffect(() => {
    if (!isPopoverVisible) return;

    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isPopoverVisible]);

  // Close on Escape — only active while the popover is visible
  useEffect(() => {
    if (!isPopoverVisible) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPopoverOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPopoverVisible]);

  const handleRetry = useCallback(() => {
    setPopoverOpen(false);
    onRetry?.();
  }, [onRetry]);

  const badgeClasses = [
    // Layout — min 44 px touch target height, inline badge
    "inline-flex items-center justify-center",
    "min-h-[44px] px-3 py-1 rounded-full",
    // Typography
    "text-sm font-medium select-none",
    // Status colour
    STYLE[syncStatus],
    className,
  ]
    .join(" ")
    .trim();

  // Non-interactive states (synced / pending): render a plain <span>
  if (syncStatus !== "error" || !onRetry) {
    return (
      <span
        role="status"
        aria-live="polite"
        aria-label={LABEL[syncStatus]}
        className={badgeClasses}
      >
        {LABEL[syncStatus]}
      </span>
    );
  }

  // Error state with onRetry: render a tappable button + popover
  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="שגיאת סנכרון — לחץ לפרטים"
        aria-expanded={isPopoverVisible}
        aria-haspopup="dialog"
        onClick={() => setPopoverOpen((prev) => !prev)}
        className={[
          badgeClasses,
          // Button reset + pointer cursor
          "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1",
        ].join(" ")}
      >
        {LABEL[syncStatus]}
      </button>

      {isPopoverVisible && (
        <div
          role="dialog"
          aria-label="פרטי שגיאת סנכרון"
          // Position: above the button in RTL layouts
          className={[
            "absolute bottom-full mb-2 end-0",
            "z-50 w-64",
            "rounded-xl shadow-lg",
            "border border-red-200",
            "bg-white",
            "p-4",
          ].join(" ")}
        >
          {/* Arrow pointing down */}
          <div
            aria-hidden="true"
            className="absolute bottom-[-6px] end-4 w-3 h-3 rotate-45 border-b border-e border-red-200 bg-white"
          />

          {/* Error message */}
          <p className="text-sm text-red-700 leading-snug mb-3">
            שמור מקומית בלבד — לחץ לנסות שוב
          </p>

          {/* Retry button */}
          <button
            type="button"
            onClick={handleRetry}
            className={[
              "w-full rounded-lg py-2.5 px-4",
              "text-sm font-semibold text-white",
              "min-h-[44px]",
              "transition-all duration-150 active:scale-[0.98]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1",
            ].join(" ")}
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            נסה שוב
          </button>
        </div>
      )}
    </div>
  );
}

export default SyncIndicator;
