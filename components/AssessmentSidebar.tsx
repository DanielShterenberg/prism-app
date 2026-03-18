/**
 * AssessmentSidebar — sidebar navigation for desktop layout.
 *
 * Displays the full assessment list on the right side (RTL) of wide screens.
 * Used inside DesktopLayout to give desktop users a persistent navigation panel.
 *
 * - Highlights the currently active assessment
 * - Shows patient name, date, and status badge per row
 * - Provides a "הערכה חדשה" (New Assessment) button at the bottom
 *
 * Touch targets ≥ 44px on all interactive elements.
 * RTL layout is inherited from root <html dir="rtl">.
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/hooks/useAssessments";
import type { AssessmentStatus } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_LABEL: Record<AssessmentStatus, string> = {
  in_progress: "בתהליך",
  completed: "הושלם",
};

const STATUS_STYLE: Record<AssessmentStatus, string> = {
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AssessmentSidebarProps {
  /** The ID of the currently open assessment, if any. */
  activeId?: string;
  /** Called when the user wants to create a new assessment. */
  onNewAssessment?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssessmentSidebar({
  activeId,
  onNewAssessment,
}: AssessmentSidebarProps) {
  const { assessments, loading } = useAssessments();
  const router = useRouter();

  return (
    <aside
      aria-label="רשימת הערכות"
      className={[
        // Layout
        "flex flex-col h-full",
        // Appearance
        "bg-white border-s border-gray-200",
      ].join(" ")}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Sidebar header                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <h2 className="text-[15px] font-semibold text-gray-900">הערכות</h2>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Assessment list                                                      */}
      {/* ------------------------------------------------------------------ */}
      <nav
        aria-label="ניווט בין הערכות"
        className="flex-1 overflow-y-auto scrollbar-none py-2"
      >
        {loading ? (
          /* Skeleton rows */
          <ul aria-busy="true" aria-label="טוען הערכות">
            {[1, 2, 3].map((i) => (
              <li key={i} className="px-3 py-2">
                <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
              </li>
            ))}
          </ul>
        ) : assessments.length === 0 ? (
          <p className="px-4 py-6 text-[14px] text-gray-400 text-center">
            אין הערכות עדיין
          </p>
        ) : (
          <ul role="list">
            {assessments.map((a) => {
              const isActive = a.id === activeId;
              const patientName = a.identification?.patientName || "ללא שם";
              const assessmentDate = a.identification?.assessmentDate || "";

              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/assessment/${a.id}`)}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`הערכה של ${patientName}${assessmentDate ? `, ${assessmentDate}` : ""}, ${STATUS_LABEL[a.status]}`}
                    className={[
                      // Layout
                      "w-full text-start flex flex-col gap-1",
                      "px-4 py-3 mx-1",
                      "rounded-xl",
                      // Min touch target
                      "min-h-[56px]",
                      // Active vs inactive
                      isActive
                        ? "bg-blue-50 text-blue-900"
                        : "text-gray-700 hover:bg-gray-50",
                      // Interaction
                      "transition-colors duration-150",
                      // Focus
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                    ].join(" ")}
                  >
                    <span className="text-[14px] font-medium leading-snug truncate block">
                      {patientName}
                    </span>
                    <div className="flex items-center gap-2">
                      {assessmentDate && (
                        <span className="text-[12px] text-gray-500">
                          {assessmentDate}
                        </span>
                      )}
                      <span
                        className={[
                          "text-[11px] font-medium px-2 py-0.5 rounded-full",
                          STATUS_STYLE[a.status],
                        ].join(" ")}
                      >
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* New assessment button                                                */}
      {/* ------------------------------------------------------------------ */}
      {onNewAssessment && (
        <div className="p-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onNewAssessment}
            aria-label="הערכה חדשה"
            className={[
              "w-full rounded-xl bg-blue-600 text-white",
              "py-2.5 px-4",
              "text-[15px] font-semibold",
              "min-h-[44px]",
              "flex items-center justify-center gap-2",
              "hover:bg-blue-700 active:scale-[0.99] transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
            ].join(" ")}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            הערכה חדשה
          </button>
        </div>
      )}
    </aside>
  );
}

export default AssessmentSidebar;
