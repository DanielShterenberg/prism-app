/**
 * BlockB — Family Background form block.
 *
 * Fields:
 *  - אב (father) — textarea
 *  - אם (mother) — textarea
 *  - מצב הורים (parent status) — short text
 *  - עיר (city) — short text
 *  - אחים/אחיות (siblings) — textarea
 *  - אבחנות במשפחה (family diagnoses) — textarea
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
import type { Assessment, FamilyBackground } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlockBProps {
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

const INPUT_CLASS = [
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3",
  "text-[17px] leading-snug text-gray-900 placeholder-gray-400",
  "min-h-[52px]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1",
  "transition-colors duration-150",
].join(" ");

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

export function BlockB({ assessment, onUpdate }: BlockBProps) {
  const familyBackground = useMemo(
    () => assessment.familyBackground ?? {},
    [assessment.familyBackground]
  );

  // -------------------------------------------------------------------------
  // Save helper — merges a partial FamilyBackground update into localStorage
  // and calls onUpdate with the fresh snapshot.
  // -------------------------------------------------------------------------
  const save = useCallback(
    (patch: Partial<FamilyBackground>) => {
      const updated = updateAssessment(assessment.id, {
        familyBackground: {
          ...familyBackground,
          ...patch,
        } as FamilyBackground,
        syncStatus: "pending",
      });
      if (updated) {
        onUpdate(updated);
      }
    },
    [assessment.id, familyBackground, onUpdate]
  );

  // -------------------------------------------------------------------------
  // Field handler
  // -------------------------------------------------------------------------

  function handleField(field: keyof FamilyBackground, value: string) {
    save({ [field]: value } as Partial<FamilyBackground>);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <section aria-labelledby="block-b-title">
      <h2 id="block-b-title" className="sr-only">
        בלוק ב — רקע משפחתי
      </h2>

      <div className="flex flex-col gap-6">
        {/* ---------------------------------------------------------------- */}
        {/* אב — Father                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-b-father" className={LABEL_CLASS}>
            אב
          </label>
          <textarea
            id="block-b-father"
            rows={3}
            placeholder="פרטים על האב"
            value={familyBackground.father ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("father", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* אם — Mother                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-b-mother" className={LABEL_CLASS}>
            אם
          </label>
          <textarea
            id="block-b-mother"
            rows={3}
            placeholder="פרטים על האם"
            value={familyBackground.mother ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("mother", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* מצב הורים — Parent status                                        */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-b-parent-status" className={LABEL_CLASS}>
            מצב הורים
          </label>
          <input
            id="block-b-parent-status"
            type="text"
            autoComplete="off"
            placeholder="למשל: נשואים, גרושים, פרודים"
            value={familyBackground.parentStatus ?? ""}
            onChange={(e) => handleField("parentStatus", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* עיר — City                                                        */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-b-city" className={LABEL_CLASS}>
            עיר
          </label>
          <input
            id="block-b-city"
            type="text"
            autoComplete="off"
            placeholder="עיר מגורים"
            value={familyBackground.city ?? ""}
            onChange={(e) => handleField("city", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* אחים/אחיות — Siblings                                            */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-b-siblings" className={LABEL_CLASS}>
            אחים/אחיות
          </label>
          <textarea
            id="block-b-siblings"
            rows={3}
            placeholder="פרטים על אחים ואחיות"
            value={familyBackground.siblings ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("siblings", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* אבחנות במשפחה — Family diagnoses                                 */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-b-family-diagnoses" className={LABEL_CLASS}>
            אבחנות במשפחה
          </label>
          <textarea
            id="block-b-family-diagnoses"
            rows={3}
            placeholder="אבחנות רלוונטיות במשפחה"
            value={familyBackground.familyDiagnoses ?? ""}
            onChange={(e) => {
              autoExpand(e.target);
              handleField("familyDiagnoses", e.target.value);
            }}
            onFocus={(e) => autoExpand(e.target)}
            className={TEXTAREA_CLASS}
          />
        </div>
      </div>
    </section>
  );
}

export default BlockB;
