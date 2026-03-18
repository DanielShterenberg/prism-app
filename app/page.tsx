"use client";

/**
 * Home screen — Assessment list.
 *
 * - Loads all assessments from localStorage immediately (no flash).
 * - Reconciles with cloud in the background.
 * - Shows assessment cards sorted by updatedAt desc.
 * - Empty state with a prompt to create the first assessment.
 * - FAB (Floating Action Button) at the bottom-left (RTL: left = visual right)
 *   to create a new assessment.
 * - NewAssessmentModal opens when FAB is pressed.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/hooks/useAssessments";
import AssessmentCard from "@/components/AssessmentCard";
import NewAssessmentModal from "@/components/NewAssessmentModal";
import OnboardingModal from "@/components/OnboardingModal";

export default function HomePage() {
  const { assessments, loading, syncing } = useAssessments();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  function handleNewAssessment() {
    setModalOpen(true);
  }

  function handleCardClick(id: string) {
    router.push(`/assessment/${id}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">הערכות</h1>

          {/* Cloud sync spinner — visible only while background sync runs */}
          {syncing && (
            <span
              role="status"
              aria-label="מסנכרן עם הענן"
              className="text-xs text-gray-400 animate-pulse"
            >
              מסנכרן...
            </span>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-2xl mx-auto px-4 pt-6">
        {loading ? (
          /* Skeleton — only shown during the initial localStorage read (usually <1 frame) */
          <div
            role="status"
            aria-label="טוען הערכות"
            className="flex flex-col gap-3"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : assessments.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <p className="text-gray-500 text-lg leading-relaxed">
              עדיין אין הערכות.
              <br />
              לחץ על + כדי להתחיל.
            </p>
          </div>
        ) : (
          /* Assessment card list */
          <ul className="flex flex-col gap-3" role="list">
            {assessments.map((a) => (
              <li key={a.id}>
                <AssessmentCard assessment={a} onClick={handleCardClick} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAB — New Assessment                                                 */}
      {/* ------------------------------------------------------------------ */}
      {/* RTL: fixed to bottom-left visually = bottom-right in physical coords */}
      <button
        type="button"
        onClick={handleNewAssessment}
        aria-label="הערכה חדשה"
        className={[
          // Position — bottom-left in RTL (start = right side of screen in LTR, left in RTL)
          "fixed bottom-6 start-6",
          // Size — 56 px: well above 44 px minimum touch target
          "w-14 h-14 rounded-full",
          // Appearance
          "bg-blue-600 text-white shadow-lg",
          "flex items-center justify-center",
          // Typography
          "text-3xl font-light leading-none",
          // Interaction
          "hover:bg-blue-700 active:scale-95 transition-all duration-150",
          // Focus
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
        ].join(" ")}
      >
        +
      </button>

      {/* ------------------------------------------------------------------ */}
      {/* New Assessment Modal                                                 */}
      {/* ------------------------------------------------------------------ */}
      {modalOpen && (
        <NewAssessmentModal onClose={() => setModalOpen(false)} />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Onboarding Modal — shown once on first visit                        */}
      {/* ------------------------------------------------------------------ */}
      <OnboardingModal />
    </main>
  );
}
