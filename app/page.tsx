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
import { useAuth } from "@/components/AuthProvider";
import AssessmentCard from "@/components/AssessmentCard";
import NewAssessmentModal from "@/components/NewAssessmentModal";
import OnboardingModal from "@/components/OnboardingModal";
import PrismLogo from "@/components/PrismLogo";

export default function HomePage() {
  const { token } = useAuth();
  const { assessments, loading, syncing } = useAssessments(token ?? undefined);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  function handleNewAssessment() {
    setModalOpen(true);
  }

  function handleCardClick(id: string) {
    router.push(`/assessment/${id}`);
  }

  return (
    <main className="min-h-screen pb-28" style={{ backgroundColor: "#f4f4f8" }}>
      {/* Dark header band */}
      <div style={{ backgroundColor: "#09090f" }}>
        <header className="sticky top-0 z-10" style={{ backgroundColor: "#09090f" }}>
          <div className="max-w-4xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
            <PrismLogo />
            {syncing && (
              <span role="status" aria-label="מסנכרן עם הענן"
                className="text-xs animate-pulse"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                מסנכרן...
              </span>
            )}
          </div>
        </header>

        {/* Hero section inside dark band */}
        <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-2 pb-12">
          <h1 className="text-3xl font-bold text-white tracking-tight">הערכות</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            רשימת המטופלים שלך
          </p>
        </div>
      </div>

      {/* Cards pulled up over dark band */}
      <section
        className="max-w-4xl mx-auto px-4 lg:px-8 -mt-6"
        aria-label="רשימת הערכות"
      >
        {loading ? (
          <div role="status" aria-label="טוען הערכות" className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[88px] rounded-xl bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
              style={{ background: "rgba(124,58,237,0.08)" }}>
              <span className="text-2xl" style={{ color: "#7c3aed" }}>+</span>
            </div>
            <p className="text-gray-500 text-base leading-relaxed">
              עדיין אין הערכות.
              <br />
              <span className="text-sm text-gray-400">לחץ על + כדי להתחיל</span>
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5" role="list">
            {assessments.map((a) => (
              <li key={a.id}>
                <AssessmentCard assessment={a} onClick={handleCardClick} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* FAB */}
      <button
        type="button"
        onClick={handleNewAssessment}
        aria-label="הערכה חדשה — לחץ ליצירת הערכה חדשה"
        className="fixed bottom-6 start-6 w-14 h-14 rounded-full flex items-center justify-center text-3xl font-light text-white leading-none active:scale-95 transition-all duration-150 focus:outline-none"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
        }}
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
