/**
 * BlockC — Developmental Background form block.
 *
 * Fields:
 *  - הריון (pregnancy) — textarea
 *  - מהלך ההריון (course of pregnancy) — textarea
 *  - לידה (birth) — textarea
 *  - פרוצדורות רפואיות (medical procedures) — textarea
 *  - הנקה (breastfeeding) — textarea
 *  - קשיים בשנה הראשונה (difficulties in first year) — textarea
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
import type { Assessment, DevelopmentalBackground } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlockCProps {
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

export function BlockC({ assessment, onUpdate }: BlockCProps) {
  const developmentalBackground = useMemo(
    () => assessment.developmentalBackground ?? {},
    [assessment.developmentalBackground]
  );

  // -------------------------------------------------------------------------
  // Save helper — merges a partial DevelopmentalBackground update into
  // localStorage and calls onUpdate with the fresh snapshot.
  // -------------------------------------------------------------------------
  const save = useCallback(
    (patch: Partial<DevelopmentalBackground>) => {
      const updated = updateAssessment(assessment.id, {
        developmentalBackground: {
          ...developmentalBackground,
          ...patch,
        } as DevelopmentalBackground,
        syncStatus: "pending",
      });
      if (updated) {
        onUpdate(updated);
      }
    },
    [assessment.id, developmentalBackground, onUpdate]
  );

  // -------------------------------------------------------------------------
  // Field handler
  // -------------------------------------------------------------------------

  function handleField(field: keyof DevelopmentalBackground, value: string) {
    save({ [field]: value } as Partial<DevelopmentalBackground>);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <section aria-labelledby="block-c-title">
      <h2 id="block-c-title" className="sr-only">
        בלוק ג — רקע התפתחותי
      </h2>

      <div className="flex flex-col gap-6">
        {/* ---------------------------------------------------------------- */}
        {/* הריון — Pregnancy                                                 */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-c-pregnancy" className={LABEL_CLASS}>
            הריון
          </label>
          <textarea
            id="block-c-pregnancy"
            rows={3}
            placeholder="פרטים על ההריון"
            value={developmentalBackground.pregnancy ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("pregnancy", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* מהלך ההריון — Course of pregnancy                               */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-c-pregnancy-course" className={LABEL_CLASS}>
            מהלך ההריון
          </label>
          <textarea
            id="block-c-pregnancy-course"
            rows={3}
            placeholder="תאור מהלך ההריון"
            value={developmentalBackground.pregnancyCourse ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("pregnancyCourse", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* לידה — Birth                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-c-birth" className={LABEL_CLASS}>
            לידה
          </label>
          <textarea
            id="block-c-birth"
            rows={3}
            placeholder="פרטים על הלידה"
            value={developmentalBackground.birth ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("birth", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* פרוצדורות רפואיות — Medical procedures                          */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-c-medical-procedures" className={LABEL_CLASS}>
            פרוצדורות רפואיות
          </label>
          <textarea
            id="block-c-medical-procedures"
            rows={3}
            placeholder="פרוצדורות רפואיות רלוונטיות"
            value={developmentalBackground.medicalProcedures ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("medicalProcedures", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* הנקה — Breastfeeding                                              */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-c-breastfeeding" className={LABEL_CLASS}>
            הנקה
          </label>
          <textarea
            id="block-c-breastfeeding"
            rows={3}
            placeholder="פרטים על ההנקה"
            value={developmentalBackground.breastfeeding ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("breastfeeding", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* קשיים בשנה הראשונה — Difficulties in first year                 */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label
            htmlFor="block-c-first-year-difficulties"
            className={LABEL_CLASS}
          >
            קשיים בשנה הראשונה
          </label>
          <textarea
            id="block-c-first-year-difficulties"
            rows={3}
            placeholder="קשיים שהתעוררו בשנה הראשונה לחיים"
            value={developmentalBackground.firstYearDifficulties ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("firstYearDifficulties", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>
      </div>
    </section>
  );
}

export default BlockC;
