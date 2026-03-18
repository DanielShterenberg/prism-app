/**
 * BlockA — Patient Identification form block.
 *
 * Fields:
 *  - שם המטופל/ת (patient name) — text input
 *  - תאריך לידה (date of birth) — text input, DD/MM/YYYY
 *  - מסגרת חינוכית (educational framework) — text input
 *  - תאריך הערכה (assessment date) — text input, DD/MM/YYYY
 *  - כלי הערכה (assessment tools) — multi-select chips
 *  - בודק/ת (examiner) — text input
 *  - סיבת הפניה (referral reason) — expanding textarea
 *
 * Auto-saves on every change:
 *  1. Writes to localStorage via updateAssessment()
 *  2. Passes the updated snapshot to the parent via onUpdate()
 *     so the parent can hand it to useSync for cloud sync.
 *
 * Layout: RTL inherited from root <html dir="rtl">.
 * Font size ≥ 16pt on all inputs (prevents iPad Safari auto-zoom on focus).
 * Touch targets ≥ 44px on all interactive elements.
 */

"use client";

import React, { useCallback, useMemo } from "react";
import { updateAssessment } from "@/lib/localStorage";
import type { Assessment, Identification } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ASSESSMENT_TOOLS = [
  "ADOS-2",
  "ADI-R",
  "Vineland-3",
  "BRIEF-2",
  "BASC-3",
  "CONNERS-3",
  "WISC-V",
  "WPPSI-IV",
  "Leiter-3",
  "Bayley-4",
  "PEP-3",
  "CARS-2",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlockAProps {
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
  // ≥ 16pt prevents iPad Safari auto-zoom; 17px ≈ 12.75pt, but Tailwind 17px ~= 12.75pt.
  // We use text-[17px] which matches the rest of the shell's 17px convention.
  // The critical constraint is font-size ≥ 16px (not pt — px).
  "min-h-[52px]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1",
  "transition-colors duration-150",
].join(" ");

const LABEL_CLASS = "block text-[15px] font-medium text-gray-700 mb-1.5";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BlockA({ assessment, onUpdate }: BlockAProps) {
  const identification = useMemo(
    () => assessment.identification ?? {},
    [assessment.identification]
  );

  // -------------------------------------------------------------------------
  // Save helper — merges a partial Identification update into localStorage
  // and calls onUpdate with the fresh snapshot.
  // -------------------------------------------------------------------------
  const save = useCallback(
    (patch: Partial<Identification>) => {
      const updated = updateAssessment(assessment.id, {
        identification: {
          ...identification,
          ...patch,
        } as Identification,
        syncStatus: "pending",
      });
      if (updated) {
        onUpdate(updated);
      }
    },
    [assessment.id, identification, onUpdate]
  );

  // -------------------------------------------------------------------------
  // Field handlers
  // -------------------------------------------------------------------------

  function handleTextField(
    field: keyof Identification,
    value: string
  ) {
    save({ [field]: value } as Partial<Identification>);
  }

  function handleToolToggle(tool: string) {
    const current = identification.assessmentTools ?? [];
    const next = current.includes(tool)
      ? current.filter((t) => t !== tool)
      : [...current, tool];
    save({ assessmentTools: next });
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <section aria-labelledby="block-a-title">
      <h2 id="block-a-title" className="sr-only">
        בלוק א — זיהוי מטופל
      </h2>

      <div className="flex flex-col gap-6">
        {/* ---------------------------------------------------------------- */}
        {/* שם המטופל/ת — Patient name                                       */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-a-patient-name" className={LABEL_CLASS}>
            שם המטופל/ת
          </label>
          <input
            id="block-a-patient-name"
            type="text"
            autoComplete="off"
            placeholder="שם פרטי ושם משפחה"
            value={identification.patientName ?? ""}
            onChange={(e) =>
              handleTextField("patientName", e.target.value)
            }
            className={INPUT_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* תאריך לידה — Date of birth                                       */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-a-dob" className={LABEL_CLASS}>
            תאריך לידה
          </label>
          <input
            id="block-a-dob"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="DD/MM/YYYY"
            value={identification.dateOfBirth ?? ""}
            onChange={(e) =>
              handleTextField("dateOfBirth", e.target.value)
            }
            className={INPUT_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* מסגרת חינוכית — Educational framework                            */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label
            htmlFor="block-a-educational-framework"
            className={LABEL_CLASS}
          >
            מסגרת חינוכית
          </label>
          <input
            id="block-a-educational-framework"
            type="text"
            autoComplete="off"
            placeholder="למשל: גן חובה, כיתה א׳, בית ספר מיוחד"
            value={identification.educationalFramework ?? ""}
            onChange={(e) =>
              handleTextField("educationalFramework", e.target.value)
            }
            className={INPUT_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* תאריך הערכה — Assessment date                                    */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-a-assessment-date" className={LABEL_CLASS}>
            תאריך הערכה
          </label>
          <input
            id="block-a-assessment-date"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="DD/MM/YYYY"
            value={identification.assessmentDate ?? ""}
            onChange={(e) =>
              handleTextField("assessmentDate", e.target.value)
            }
            className={INPUT_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* כלי הערכה — Assessment tools (multi-select chips)                */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <span id="block-a-tools-label" className={LABEL_CLASS}>
            כלי הערכה
          </span>
          <div
            role="group"
            aria-labelledby="block-a-tools-label"
            className="flex flex-wrap gap-2 mt-1"
          >
            {ASSESSMENT_TOOLS.map((tool) => {
              const selected = (identification.assessmentTools ?? []).includes(
                tool
              );
              return (
                <button
                  key={tool}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleToolToggle(tool)}
                  className={[
                    // Touch target ≥ 44px
                    "min-h-[44px] px-4 py-2 rounded-full border",
                    "text-[15px] font-medium leading-snug",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1",
                    "transition-colors duration-150",
                    selected
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600",
                  ].join(" ")}
                >
                  {tool}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* בודק/ת — Examiner                                                */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-a-examiner" className={LABEL_CLASS}>
            בודק/ת
          </label>
          <input
            id="block-a-examiner"
            type="text"
            autoComplete="off"
            placeholder="שם הבודק/ת"
            value={identification.examiner ?? ""}
            onChange={(e) =>
              handleTextField("examiner", e.target.value)
            }
            className={INPUT_CLASS}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* סיבת הפניה — Referral reason (expanding textarea)               */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="block-a-referral-reason" className={LABEL_CLASS}>
            סיבת הפניה
          </label>
          {/*
            The textarea grows with content:
            - overflow-hidden prevents scrollbar
            - rows={3} gives a comfortable starting height
            - onInput handler adjusts height to scrollHeight so it never clips
          */}
          <textarea
            id="block-a-referral-reason"
            rows={3}
            placeholder="תאר/י את סיבת הפניה להערכה"
            value={identification.referralReason ?? ""}
            onChange={(e) => {
              // Expand to fit content
              const el = e.target as HTMLTextAreaElement;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
              handleTextField("referralReason", e.target.value);
            }}
            onFocus={(e) => {
              // Also expand on focus (covers pre-filled content on mount)
              const el = e.target as HTMLTextAreaElement;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
            className={[
              "w-full rounded-xl border border-gray-300 bg-white px-4 py-3",
              "text-[17px] leading-relaxed text-gray-900 placeholder-gray-400",
              "min-h-[100px] resize-none overflow-hidden",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1",
              "transition-colors duration-150",
            ].join(" ")}
          />
        </div>
      </div>
    </section>
  );
}

export default BlockA;
