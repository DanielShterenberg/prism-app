"use client";

/**
 * Anamnesis screen — /assessment/[id]
 *
 * This is the outer shell of the anamnesis form. It provides:
 *  - Header: patient name + assessment date
 *  - BlockTabBar: 5 tabs (A–E) with active indicator and completed checkmarks
 *  - A content area where the active block form is rendered
 *  - A "סיום" (Finish) button that navigates to /assessment/[id]/summary
 *
 * Data:
 *  - Loaded from localStorage immediately on mount (offline-first).
 *  - If the assessment is not found (bad id / cleared storage), shows an error.
 *  - Auto-saves on every change via updateAssessment() + useSync.
 *
 * Layout: RTL inherited from root <html dir="rtl">.
 */

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAssessment } from "@/hooks/useAssessment";
import { useSync } from "@/hooks/useSync";
import BlockTabBar, { BLOCKS } from "@/components/BlockTabBar";
import BlockA from "@/components/BlockA";
import BlockB from "@/components/BlockB";
import BlockC from "@/components/BlockC";
import BlockD from "@/components/BlockD";
import BlockE from "@/components/BlockE";
import AssessmentSidebar from "@/components/AssessmentSidebar";
import NewAssessmentModal from "@/components/NewAssessmentModal";
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

  const { assessment, notFound, refresh } = useAssessment(id);
  const [activeBlock, setActiveBlock] = useState<BlockId>("A");
  const [newAssessmentModalOpen, setNewAssessmentModalOpen] = useState(false);

  // Snapshot passed to useSync — updated whenever a block saves.
  const [syncSnapshot, setSyncSnapshot] = useState<Assessment | null>(null);

  // Sync hook — debounced cloud sync, offline-first.
  useSync({
    assessment: syncSnapshot,
    onSyncStatusChange: () => {
      // Refresh local state after sync outcome so syncStatus indicator stays accurate.
      refresh();
    },
  });

  // Called by block components after each field change.
  const handleBlockUpdate = useCallback(
    (updated: Assessment) => {
      setSyncSnapshot(updated);
      // Also refresh the assessment state so the header reflects any changes.
      refresh();
    },
    [refresh]
  );

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
    <>
      {/* ================================================================== */}
      {/* Desktop two-column layout                                           */}
      {/*                                                                    */}
      {/* Mobile (< lg): single-column — classic sticky header + content     */}
      {/* Desktop (≥ lg): sidebar on the right (RTL), content on the left   */}
      {/*   The outer wrapper constrains to ~900px and centers horizontally  */}
      {/* ================================================================== */}
      <div className="min-h-screen bg-gray-50">
        {/* ---------------------------------------------------------------- */}
        {/* Mobile header — hidden on desktop                                */}
        {/* ---------------------------------------------------------------- */}
        <header
          className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm"
          aria-label="כותרת הערכה"
        >
          <div className="px-4 py-4">
            {/* Back button + patient name row */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                aria-label="חזרה לרשימה"
                className={[
                  "w-11 h-11 flex items-center justify-center rounded-full",
                  "text-gray-500 hover:text-gray-800 hover:bg-gray-100",
                  "transition-colors duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                  "flex-shrink-0",
                ].join(" ")}
              >
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

          {/* Block tab bar — mobile only */}
          <BlockTabBar
            activeBlock={activeBlock}
            completedBlocks={completedBlocks}
            onSelectBlock={setActiveBlock}
          />
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Desktop + mobile content wrapper                                  */}
        {/* ---------------------------------------------------------------- */}
        <div className="max-w-[900px] mx-auto lg:px-6 lg:py-6 lg:flex lg:gap-0 lg:items-start lg:min-h-screen">
          {/* ============================================================== */}
          {/* Sidebar — right side in RTL, desktop only                       */}
          {/* ============================================================== */}
          <div
            className={[
              // Hidden on mobile — shown as sticky column on desktop
              "hidden lg:flex lg:flex-col",
              // Width
              "lg:w-64 xl:w-72",
              // Sticky so it stays visible while scrolling content
              "lg:sticky lg:top-6",
              // Max height prevents sidebar from overflowing viewport
              "lg:max-h-[calc(100vh-3rem)]",
              // Order: in RTL, sidebar is on the right → order-last in flex
              "lg:order-last",
              // Rounded card
              "rounded-2xl overflow-hidden border border-gray-200 shadow-sm",
            ].join(" ")}
          >
            <AssessmentSidebar
              activeId={id}
              onNewAssessment={() => setNewAssessmentModalOpen(true)}
            />
          </div>

          {/* ============================================================== */}
          {/* Main content column                                              */}
          {/* ============================================================== */}
          <div className="flex-1 min-w-0 lg:pe-4 flex flex-col">
            {/* Desktop header — hidden on mobile */}
            <div
              className={[
                "hidden lg:block",
                "bg-white rounded-2xl border border-gray-200 shadow-sm",
                "px-6 py-4 mb-4",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  aria-label="חזרה לרשימה"
                  className={[
                    "w-11 h-11 flex items-center justify-center rounded-full",
                    "text-gray-500 hover:text-gray-800 hover:bg-gray-100",
                    "transition-colors duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                    "flex-shrink-0",
                  ].join(" ")}
                >
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

              {/* Block tab bar — desktop */}
              <div className="mt-3 -mx-6 border-t border-gray-100">
                <BlockTabBar
                  activeBlock={activeBlock}
                  completedBlocks={completedBlocks}
                  onSelectBlock={setActiveBlock}
                />
              </div>
            </div>

            {/* Block content area */}
            <main
              id="block-content"
              className="flex-1 px-4 lg:px-0 py-6 lg:py-0 pb-32 lg:pb-24"
              aria-label={`טופס בלוק ${activeBlock}`}
            >
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
                {activeBlock === "A" && (
                  <BlockA assessment={assessment} onUpdate={handleBlockUpdate} />
                )}
                {activeBlock === "B" && (
                  <BlockB assessment={assessment} onUpdate={handleBlockUpdate} />
                )}
                {activeBlock === "C" && (
                  <BlockC assessment={assessment} onUpdate={handleBlockUpdate} />
                )}
                {activeBlock === "D" && (
                  <BlockD assessment={assessment} onUpdate={handleBlockUpdate} />
                )}
                {activeBlock === "E" && (
                  <BlockE assessment={assessment} onUpdate={handleBlockUpdate} />
                )}
              </div>
            </main>

            {/* ------------------------------------------------------------ */}
            {/* Finish button                                                  */}
            {/* Mobile: fixed at bottom of viewport                           */}
            {/* Desktop: static inside the content column                     */}
            {/* ------------------------------------------------------------ */}
            {/* Mobile finish bar */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-10 bg-white border-t border-gray-200 shadow-lg safe-bottom">
              <div className="px-4 pt-4">
                <button
                  type="button"
                  onClick={handleFinish}
                  aria-describedby="block-content"
                  className={[
                    "w-full rounded-xl bg-blue-600 text-white",
                    "py-3 px-6",
                    "text-[17px] font-semibold",
                    "min-h-[52px]",
                    "hover:bg-blue-700 active:scale-[0.99] transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
                  ].join(" ")}
                >
                  סיום
                </button>
              </div>
            </div>

            {/* Desktop finish button — inline */}
            <div className="hidden lg:block px-0 pb-6">
              <button
                type="button"
                onClick={handleFinish}
                aria-describedby="block-content"
                className={[
                  "w-full rounded-xl bg-blue-600 text-white",
                  "py-3 px-6",
                  "text-[17px] font-semibold",
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
      </div>

      {/* New Assessment Modal — triggered from desktop sidebar */}
      {newAssessmentModalOpen && (
        <NewAssessmentModal onClose={() => setNewAssessmentModalOpen(false)} />
      )}
    </>
  );
}
