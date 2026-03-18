/**
 * AssessmentCard — displays a single assessment summary on the home screen.
 *
 * Shows:
 *   - Patient name
 *   - Assessment date (from identification.assessmentDate, DD/MM/YYYY)
 *   - Status badge: "בתהליך" (in_progress) or "הושלם" (completed)
 *   - Progress indicator: how many of the 5 blocks have any data filled
 *   - Sync status dot
 *
 * Touch target: the entire card is a button ≥ 44 px tall.
 * RTL layout is inherited from the root <html dir="rtl">.
 */

import React from "react";
import type { Assessment, AssessmentStatus, SyncStatus } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_BLOCKS = 5;

const STATUS_LABEL: Record<AssessmentStatus, string> = {
  in_progress: "בתהליך",
  completed: "הושלם",
};

const STATUS_STYLE: Record<AssessmentStatus, string> = {
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

const SYNC_DOT_STYLE: Record<SyncStatus, string> = {
  synced: "bg-green-400",
  pending: "bg-amber-400 animate-pulse",
  error: "bg-red-400",
};

const SYNC_ARIA: Record<SyncStatus, string> = {
  synced: "נשמר בענן",
  pending: "מסנכרן...",
  error: "שמור מקומית בלבד",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Counts how many of the 5 assessment blocks contain at least one non-empty
 * field. Blocks: identification, familyBackground, developmentalBackground,
 * developmentalMilestones, frameworksAndTreatments.
 */
function countFilledBlocks(assessment: Assessment): number {
  const blocks = [
    assessment.identification,
    assessment.familyBackground,
    assessment.developmentalBackground,
    assessment.developmentalMilestones,
    assessment.frameworksAndTreatments,
  ];

  return blocks.filter((block) => {
    if (!block) return false;
    return Object.values(block).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && String(v).trim() !== "";
    });
  }).length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface AssessmentCardProps {
  assessment: Assessment;
  onClick?: (id: string) => void;
}

export function AssessmentCard({ assessment, onClick }: AssessmentCardProps) {
  const filledBlocks = countFilledBlocks(assessment);
  const patientName =
    assessment.identification?.patientName || "ללא שם";
  const assessmentDate =
    assessment.identification?.assessmentDate || "";

  return (
    <button
      type="button"
      onClick={() => onClick?.(assessment.id)}
      className={[
        // Layout
        "w-full text-right flex flex-col gap-2",
        "rounded-2xl border border-gray-200 bg-white",
        "px-5 py-4 shadow-sm",
        // Touch target — minimum 44 px achieved by padding + content
        "min-h-[80px]",
        // Interaction
        "hover:border-blue-300 hover:shadow-md transition-all duration-150",
        "active:scale-[0.99]",
        "cursor-pointer",
        // Focus ring for accessibility
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
      ].join(" ")}
      aria-label={`הערכה של ${patientName}, ${assessmentDate}`}
    >
      {/* Top row: patient name + sync dot */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[17px] font-semibold text-gray-900 leading-snug">
          {patientName}
        </h2>
        <span
          role="status"
          aria-label={SYNC_ARIA[assessment.syncStatus]}
          className={[
            "inline-block w-2.5 h-2.5 rounded-full flex-shrink-0",
            SYNC_DOT_STYLE[assessment.syncStatus],
          ].join(" ")}
        />
      </div>

      {/* Bottom row: date, status badge, progress */}
      <div className="flex items-center gap-3 flex-wrap">
        {assessmentDate && (
          <span className="text-sm text-gray-500">{assessmentDate}</span>
        )}

        <span
          className={[
            "text-xs font-medium px-2.5 py-0.5 rounded-full",
            STATUS_STYLE[assessment.status],
          ].join(" ")}
        >
          {STATUS_LABEL[assessment.status]}
        </span>

        <span className="text-sm text-gray-500 me-auto">
          {filledBlocks} מתוך {TOTAL_BLOCKS} בלוקים
        </span>
      </div>
    </button>
  );
}

export default AssessmentCard;
