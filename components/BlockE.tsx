/**
 * BlockE — Frameworks & Treatments form block.
 *
 * Fields:
 *  - מסגרות חינוכיות (educational frameworks) — textarea
 *  - טיפולים (treatments) — textarea
 *  - הערכות קודמות (prior assessments) — textarea
 *  - תקשורת עם צוות טיפולי (communication with treatment staff) — textarea
 *
 * Auto-saves on every change:
 *  1. Writes to localStorage via updateAssessment()
 *  2. Passes the updated snapshot to the parent via onUpdate()
 *
 * Layout: RTL inherited from root <html dir="rtl">.
 * Font size ≥ 16px on all inputs (prevents iPad Safari auto-zoom on focus).
 * Touch targets ≥ 44px on all interactive elements.
 */

"use client";

import React, { useCallback, useMemo } from "react";
import { updateAssessment } from "@/lib/localStorage";
import type { Assessment, FrameworksAndTreatments } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlockEProps {
  /** The full assessment (read from localStorage by the parent). */
  assessment: Assessment;
  /**
   * Called after every field change with the updated assessment snapshot.
   * The parent should pass this to useSync to trigger cloud sync.
   */
  onUpdate: (updated: Assessment) => void;
}

// ---------------------------------------------------------------------------
// Shared style helpers
// ---------------------------------------------------------------------------

const TEXTAREA_CLASS = [
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3",
  "text-[17px] leading-relaxed text-gray-900 placeholder-gray-400",
  "min-h-[100px] resize-none overflow-hidden",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1",
  "transition-colors duration-150",
].join(" ");

const LABEL_CLASS = "block text-[15px] font-medium text-gray-700 mb-1.5";

// ---------------------------------------------------------------------------
// Auto-expand helper
// ---------------------------------------------------------------------------

function autoExpand(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BlockE({ assessment, onUpdate }: BlockEProps) {
  const frameworksAndTreatments = useMemo(
    () => assessment.frameworksAndTreatments ?? {},
    [assessment.frameworksAndTreatments]
  );

  // -------------------------------------------------------------------------
  // Save helper — merges a partial FrameworksAndTreatments update into
  // localStorage and calls onUpdate with the fresh snapshot.
  // -------------------------------------------------------------------------
  const save = useCallback(
    (patch: Partial<FrameworksAndTreatments>) => {
      const updated = updateAssessment(assessment.id, {
        frameworksAndTreatments: {
          ...frameworksAndTreatments,
          ...patch,
        } as FrameworksAndTreatments,
        syncStatus: "pending",
      });
      if (updated) {
        onUpdate(updated);
      }
    },
    [assessment.id, frameworksAndTreatments, onUpdate]
  );

  // -------------------------------------------------------------------------
  // Field handler
  // -------------------------------------------------------------------------

  function handleField(field: keyof FrameworksAndTreatments, value: string) {
    save({ [field]: value } as Partial<FrameworksAndTreatments>);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <section aria-labelledby="block-e-title">
      <h2 id="block-e-title" className="sr-only">
        בלוק ה — מסגרות וטיפולים
      </h2>

      <div className="flex flex-col gap-6">
        {/* ---------------------------------------------------------------- */}
        {/* מסגרות חינוכיות — Educational frameworks                         */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label
            htmlFor="block-e-educational-frameworks"
            className={LABEL_CLASS}
          >
            מסגרות חינוכיות
          </label>
          <textarea
            id="block-e-educational-frameworks"
            rows={3}
            placeholder="מסגרות חינוכיות בהן שהה/תה הילד/ה"
            value={frameworksAndTreatments.educationalFrameworks ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("educationalFrameworks", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* טיפולים — Treatments                                             */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-e-treatments" className={LABEL_CLASS}>
            טיפולים
          </label>
          <textarea
            id="block-e-treatments"
            rows={3}
            placeholder="טיפולים שהילד/ה קיבל/ה או מקבל/ת כיום"
            value={frameworksAndTreatments.treatments ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("treatments", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* הערכות קודמות — Prior assessments                               */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label
            htmlFor="block-e-previous-assessments"
            className={LABEL_CLASS}
          >
            הערכות קודמות
          </label>
          <textarea
            id="block-e-previous-assessments"
            rows={3}
            placeholder="הערכות אבחנתיות שבוצעו בעבר"
            value={frameworksAndTreatments.previousAssessments ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("previousAssessments", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* תקשורת עם צוות טיפולי — Communication with treatment staff       */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label
            htmlFor="block-e-treatment-staff"
            className={LABEL_CLASS}
          >
            תקשורת עם צוות טיפולי
          </label>
          <textarea
            id="block-e-treatment-staff"
            rows={3}
            placeholder="תיאור התקשורת עם הצוות הטיפולי"
            value={frameworksAndTreatments.treatmentStaffCommunication ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("treatmentStaffCommunication", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>
      </div>
    </section>
  );
}

export default BlockE;
