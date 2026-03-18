"use client";

/**
 * Anamnesis screen — /assessment/[id]
 *
 * This is the outer shell of the anamnesis form. It provides:
 *  - Header: patient name + assessment date
 *  - BlockTabBar: 5 tabs (A–E) with active indicator and completed checkmarks
 *  - A content area where the active block form will be rendered (later issues)
 *  - A "סיום" (Finish) button that navigates to /assessment/[id]/summary
 *
 * Data:
 *  - Loaded from localStorage immediately on mount (offline-first).
 *  - If the assessment is not found (bad id / cleared storage), shows an error.
 *
 * Layout: RTL inherited from root <html dir="rtl">.
 */

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAssessment } from "@/hooks/useAssessment";
import BlockTabBar, { BLOCKS } from "@/components/BlockTabBar";
import type { Assessment } from "@/types/assessment";
import type { BlockId } from "@/components/BlockTabBar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determines which blocks have at least one non-empty field.
 * Returns a Set of completed BlockIds.
 */
function getCompletedBlocks(assessment: Assessment): Set<BlockId> {
  const completed = new Set<BlockId>();

  const blockMap: Record<BlockId, object | undefined> = {
    A: assessment.identification,
    B: assessment.familyBackground,
    C: assessment.developmentalBackground,
    D: assessment.developmentalMilestones,
    E: assessment.frameworksAndTreatments,
  };

  for (const { id } of BLOCKS) {
    const block = blockMap[id];
    if (!block) continue;
    const hasData = Object.values(block).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && String(v).trim() !== "";
    });
    if (hasData) completed.add(id);
  }

  return completed;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const { assessment, notFound } = useAssessment(id);
  const [activeBlock, setActiveBlock] = useState<BlockId>("A");

  function handleFinish() {
    router.push(`/assessment/${id}/summary`);
  }

  // -------------------------------------------------------------------------
  // Not found state
  // -------------------------------------------------------------------------

  if (notFound || !assessment) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-gray-600 text-lg">הערכה לא נמצאה.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className={[
            "rounded-xl bg-blue-600 text-white px-6 py-3",
            "text-[17px] font-medium",
            "hover:bg-blue-700 active:scale-[0.98] transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
            // Touch target ≥ 44px
            "min-h-[48px]",
          ].join(" ")}
        >
          חזרה לרשימה
        </button>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------

  const patientName = assessment.identification?.patientName || "ללא שם";
  const assessmentDate = assessment.identification?.assessmentDate || "";
  const completedBlocks = getCompletedBlocks(assessment);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Back button + patient name row */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="חזרה לרשימה"
              className={[
                // Touch target ≥ 44px
                "w-11 h-11 flex items-center justify-center rounded-full",
                "text-gray-500 hover:text-gray-800 hover:bg-gray-100",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                "flex-shrink-0",
              ].join(" ")}
            >
              {/* Right-pointing chevron — in RTL this visually points "back" (to the right) */}
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-[17px] font-bold text-gray-900 leading-snug truncate">
                {patientName}
              </h1>
              {assessmentDate && (
                <p className="text-sm text-gray-500 leading-tight mt-0.5">
                  {assessmentDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Block tab bar — sits below the header row, still inside <header> */}
        <div className="max-w-2xl mx-auto">
          <BlockTabBar
            activeBlock={activeBlock}
            completedBlocks={completedBlocks}
            onSelectBlock={setActiveBlock}
          />
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Block content area                                                   */}
      {/* ------------------------------------------------------------------ */}
      <main
        className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-32"
        aria-label={`בלוק ${activeBlock}`}
      >
        {/*
          Block form content will be rendered here in subsequent issues
          (BlockA, BlockB, … BlockE components).
          For now we show a placeholder so the shell is navigable.
        */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 text-center text-gray-400">
          <p className="text-[17px]">
            בלוק {activeBlock} —{" "}
            {BLOCKS.find((b) => b.id === activeBlock)?.label}
          </p>
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Finish button — fixed at the bottom                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="fixed bottom-0 inset-x-0 z-10 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            type="button"
            onClick={handleFinish}
            className={[
              "w-full rounded-xl bg-blue-600 text-white",
              "py-3 px-6",
              "text-[17px] font-semibold",
              // Touch target height: py-3 + text ≈ 52px, above 44px minimum
              "min-h-[52px]",
              "hover:bg-blue-700 active:scale-[0.99] transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
            ].join(" ")}
          >
            סיום
          </button>
        </div>
      </div>
    </div>
  );
}
