/**
 * BlockD — Developmental Milestones form block.
 *
 * Two field types:
 *  1. Age fields — compact inline text inputs for numeric age values:
 *     - מילה ראשונה (first words)
 *     - צמד מילים (word pairs)
 *     - משפטים (sentences)
 *     - הליכה עצמאית (independent walking)
 *     - שליטה בסוגרים - יום (bladder control day)
 *     - שליטה בסוגרים - לילה (bladder control night)
 *     - שליטה במעיים (bowel control)
 *     - רכיבה על אופניים (bike riding age)
 *
 *  2. Textarea fields for narrative content:
 *     - רגרסיה בשפה (language regression)
 *     - מגושמות מוטורית (motor clumsiness)
 *     - נפילות (falls tendency)
 *     - טיפוס (climbing)
 *     - אכילה (eating)
 *     - שינה (sleep)
 *     - ויסות חושי (sensory regulation)
 *     - ויסות רגשי (emotional regulation)
 *
 * Auto-saves on every change via updateAssessment().
 * Layout: RTL inherited from root <html dir="rtl">.
 * Font size ≥ 16px on all inputs (prevents iPad Safari auto-zoom on focus).
 * Touch targets ≥ 44px on all interactive elements.
 */

"use client";

import React, { useCallback, useMemo } from "react";
import { updateAssessment } from "@/lib/localStorage";
import type { Assessment, DevelopmentalMilestones } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlockDProps {
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

/**
 * Compact age input — narrow width, centered text, inline beside its label.
 * min-h-[44px] ensures the touch target meets the ≥ 44px requirement.
 */
const AGE_INPUT_CLASS = [
  "w-20 rounded-xl border border-gray-300 bg-white px-3 py-2",
  "text-[17px] leading-snug text-gray-900 placeholder-gray-400 text-center",
  "min-h-[44px]",
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

/** Inline row for age fields: label on one side, compact input on the other. */
const AGE_ROW_CLASS =
  "flex items-center justify-between gap-4 py-1";

const AGE_LABEL_CLASS = "text-[15px] font-medium text-gray-700";

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

export function BlockD({ assessment, onUpdate }: BlockDProps) {
  const milestones = useMemo(
    () => assessment.developmentalMilestones ?? {},
    [assessment.developmentalMilestones]
  );

  // -------------------------------------------------------------------------
  // Save helper — merges a partial DevelopmentalMilestones update into
  // localStorage and calls onUpdate with the fresh snapshot.
  // -------------------------------------------------------------------------
  const save = useCallback(
    (patch: Partial<DevelopmentalMilestones>) => {
      const updated = updateAssessment(assessment.id, {
        developmentalMilestones: {
          ...milestones,
          ...patch,
        } as DevelopmentalMilestones,
        syncStatus: "pending",
      });
      if (updated) {
        onUpdate(updated);
      }
    },
    [assessment.id, milestones, onUpdate]
  );

  // -------------------------------------------------------------------------
  // Field handler
  // -------------------------------------------------------------------------

  function handleField(field: keyof DevelopmentalMilestones, value: string) {
    save({ [field]: value } as Partial<DevelopmentalMilestones>);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <section aria-labelledby="block-d-title">
      <h2 id="block-d-title" className="sr-only">
        בלוק ד — אבני דרך התפתחותיות
      </h2>

      <div className="flex flex-col gap-8">
        {/* ---------------------------------------------------------------- */}
        {/* Age fields — grouped in a card-like container                     */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <h3 className="text-[15px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
            גיל השגה
          </h3>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 divide-y divide-gray-200">
            {/* מילה ראשונה */}
            <div className={AGE_ROW_CLASS}>
              <label
                htmlFor="block-d-first-words"
                className={AGE_LABEL_CLASS}
              >
                מילה ראשונה
              </label>
              <input
                id="block-d-first-words"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="גיל"
                value={milestones.firstWordsAge ?? ""}
                onChange={(e) => handleField("firstWordsAge", e.target.value)}
                className={AGE_INPUT_CLASS}
              />
            </div>

            {/* צמד מילים */}
            <div className={AGE_ROW_CLASS}>
              <label
                htmlFor="block-d-word-pairs"
                className={AGE_LABEL_CLASS}
              >
                צמד מילים
              </label>
              <input
                id="block-d-word-pairs"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="גיל"
                value={milestones.wordPairsAge ?? ""}
                onChange={(e) => handleField("wordPairsAge", e.target.value)}
                className={AGE_INPUT_CLASS}
              />
            </div>

            {/* משפטים */}
            <div className={AGE_ROW_CLASS}>
              <label
                htmlFor="block-d-sentences"
                className={AGE_LABEL_CLASS}
              >
                משפטים
              </label>
              <input
                id="block-d-sentences"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="גיל"
                value={milestones.sentencesAge ?? ""}
                onChange={(e) => handleField("sentencesAge", e.target.value)}
                className={AGE_INPUT_CLASS}
              />
            </div>

            {/* הליכה עצמאית */}
            <div className={AGE_ROW_CLASS}>
              <label
                htmlFor="block-d-walking"
                className={AGE_LABEL_CLASS}
              >
                הליכה עצמאית
              </label>
              <input
                id="block-d-walking"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="גיל"
                value={milestones.independentWalkingAge ?? ""}
                onChange={(e) =>
                  handleField("independentWalkingAge", e.target.value)
                }
                className={AGE_INPUT_CLASS}
              />
            </div>

            {/* שליטה בסוגרים - יום */}
            <div className={AGE_ROW_CLASS}>
              <label
                htmlFor="block-d-bladder-day"
                className={AGE_LABEL_CLASS}
              >
                שליטה בסוגרים — יום
              </label>
              <input
                id="block-d-bladder-day"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="גיל"
                value={milestones.bladderControlDay ?? ""}
                onChange={(e) =>
                  handleField("bladderControlDay", e.target.value)
                }
                className={AGE_INPUT_CLASS}
              />
            </div>

            {/* שליטה בסוגרים - לילה */}
            <div className={AGE_ROW_CLASS}>
              <label
                htmlFor="block-d-bladder-night"
                className={AGE_LABEL_CLASS}
              >
                שליטה בסוגרים — לילה
              </label>
              <input
                id="block-d-bladder-night"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="גיל"
                value={milestones.bladderControlNight ?? ""}
                onChange={(e) =>
                  handleField("bladderControlNight", e.target.value)
                }
                className={AGE_INPUT_CLASS}
              />
            </div>

            {/* שליטה במעיים */}
            <div className={AGE_ROW_CLASS}>
              <label
                htmlFor="block-d-bowel"
                className={AGE_LABEL_CLASS}
              >
                שליטה במעיים
              </label>
              <input
                id="block-d-bowel"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="גיל"
                value={milestones.bowelControl ?? ""}
                onChange={(e) => handleField("bowelControl", e.target.value)}
                className={AGE_INPUT_CLASS}
              />
            </div>

            {/* רכיבה על אופניים */}
            <div className={AGE_ROW_CLASS}>
              <label
                htmlFor="block-d-bike"
                className={AGE_LABEL_CLASS}
              >
                רכיבה על אופניים
              </label>
              <input
                id="block-d-bike"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="גיל"
                value={milestones.bikeRidingAge ?? ""}
                onChange={(e) => handleField("bikeRidingAge", e.target.value)}
                className={AGE_INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Textarea fields                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col gap-6">
          <h3 className="text-[15px] font-semibold text-gray-500 uppercase tracking-wide -mb-2">
            תיאור תחומים
          </h3>

          {/* רגרסיה בשפה */}
          <div>
            <label htmlFor="block-d-language-regression" className={LABEL_CLASS}>
              רגרסיה בשפה
            </label>
            <textarea
              id="block-d-language-regression"
              rows={3}
              placeholder="האם נצפתה רגרסיה בשפה? פרטים"
              value={milestones.languageRegression ?? ""}
              onChange={(e) => {
                autoExpand(e.target);
                handleField("languageRegression", e.target.value);
              }}
              onFocus={(e) => autoExpand(e.target)}
              className={TEXTAREA_CLASS}
            />
          </div>

          {/* מגושמות מוטורית */}
          <div>
            <label htmlFor="block-d-motor-clumsiness" className={LABEL_CLASS}>
              מגושמות מוטורית
            </label>
            <textarea
              id="block-d-motor-clumsiness"
              rows={3}
              placeholder="תיאור מגושמות מוטורית"
              value={milestones.motorClumsiness ?? ""}
              onChange={(e) => {
                autoExpand(e.target);
                handleField("motorClumsiness", e.target.value);
              }}
              onFocus={(e) => autoExpand(e.target)}
              className={TEXTAREA_CLASS}
            />
          </div>

          {/* נפילות */}
          <div>
            <label htmlFor="block-d-falls" className={LABEL_CLASS}>
              נפילות
            </label>
            <textarea
              id="block-d-falls"
              rows={3}
              placeholder="נטייה לנפילות — תיאור"
              value={milestones.fallsTendency ?? ""}
              onChange={(e) => {
                autoExpand(e.target);
                handleField("fallsTendency", e.target.value);
              }}
              onFocus={(e) => autoExpand(e.target)}
              className={TEXTAREA_CLASS}
            />
          </div>

          {/* טיפוס */}
          <div>
            <label htmlFor="block-d-climbing" className={LABEL_CLASS}>
              טיפוס
            </label>
            <textarea
              id="block-d-climbing"
              rows={3}
              placeholder="התנהגות טיפוס — תיאור"
              value={milestones.climbing ?? ""}
              onChange={(e) => {
                autoExpand(e.target);
                handleField("climbing", e.target.value);
              }}
              onFocus={(e) => autoExpand(e.target)}
              className={TEXTAREA_CLASS}
            />
          </div>

          {/* אכילה */}
          <div>
            <label htmlFor="block-d-eating" className={LABEL_CLASS}>
              אכילה
            </label>
            <textarea
              id="block-d-eating"
              rows={3}
              placeholder="דפוסי אכילה — תיאור"
              value={milestones.eating ?? ""}
              onChange={(e) => {
                autoExpand(e.target);
                handleField("eating", e.target.value);
              }}
              onFocus={(e) => autoExpand(e.target)}
              className={TEXTAREA_CLASS}
            />
          </div>

          {/* שינה */}
          <div>
            <label htmlFor="block-d-sleep" className={LABEL_CLASS}>
              שינה
            </label>
            <textarea
              id="block-d-sleep"
              rows={3}
              placeholder="דפוסי שינה — תיאור"
              value={milestones.sleep ?? ""}
              onChange={(e) => {
                autoExpand(e.target);
                handleField("sleep", e.target.value);
              }}
              onFocus={(e) => autoExpand(e.target)}
              className={TEXTAREA_CLASS}
            />
          </div>

          {/* ויסות חושי */}
          <div>
            <label htmlFor="block-d-sensory" className={LABEL_CLASS}>
              ויסות חושי
            </label>
            <textarea
              id="block-d-sensory"
              rows={3}
              placeholder="קשיי ויסות חושי — תיאור"
              value={milestones.sensoryRegulation ?? ""}
              onChange={(e) => {
                autoExpand(e.target);
                handleField("sensoryRegulation", e.target.value);
              }}
              onFocus={(e) => autoExpand(e.target)}
              className={TEXTAREA_CLASS}
            />
          </div>

          {/* ויסות רגשי */}
          <div>
            <label htmlFor="block-d-emotional" className={LABEL_CLASS}>
              ויסות רגשי
            </label>
            <textarea
              id="block-d-emotional"
              rows={3}
              placeholder="קשיי ויסות רגשי — תיאור"
              value={milestones.emotionalRegulation ?? ""}
              onChange={(e) => {
                autoExpand(e.target);
                handleField("emotionalRegulation", e.target.value);
              }}
              onFocus={(e) => autoExpand(e.target)}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlockD;
