/**
 * SyncIndicator — subtle status badge showing the current cloud sync state.
 *
 * Displays one of three states:
 *   synced  → "נשמר ✓"           (green)
 *   pending → "מסנכרן..."         (amber, animated)
 *   error   → "שמור מקומית"       (red, offline fallback message)
 *
 * All text is Hebrew.  The component is intentionally lightweight — no
 * dependencies beyond React and Tailwind.
 *
 * Touch target is ≥ 44 px tall so it is usable on iPad even though it is
 * not interactive.
 */

import React from "react";
import type { SyncStatus } from "@/types/assessment";

export interface SyncIndicatorProps {
  syncStatus: SyncStatus;
  /** Optional extra className applied to the root element. */
  className?: string;
}

const LABEL: Record<SyncStatus, string> = {
  synced: "נשמר ✓",
  pending: "מסנכרן...",
  error: "שמור מקומית",
};

const STYLE: Record<SyncStatus, string> = {
  synced: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800 animate-pulse",
  error: "bg-red-100 text-red-700",
};

export function SyncIndicator({
  syncStatus,
  className = "",
}: SyncIndicatorProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={LABEL[syncStatus]}
      className={[
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
        .trim()}
    >
      {LABEL[syncStatus]}
    </span>
  );
}

export default SyncIndicator;
