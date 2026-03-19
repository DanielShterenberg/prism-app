/**
 * NewAssessmentModal — modal for creating a new assessment.
 *
 * Fields:
 *  - Patient name (required)
 *  - Assessment date (date picker, default today, displayed as DD/MM/YYYY)
 *
 * On submit:
 *  1. Creates an Assessment object in localStorage via saveAssessment.
 *  2. Triggers cloud sync via PUT /api/assessments/:id.
 *  3. Navigates to /assessment/[id].
 *
 * Layout: RTL, Hebrew labels.
 * Font size ≥ 16pt on all inputs (prevents iPad Safari auto-zoom).
 * Touch targets ≥ 44px on all interactive elements.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAssessment } from "@/lib/localStorage";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns today's date as a YYYY-MM-DD string (for <input type="date">). */
function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Converts a YYYY-MM-DD string (from <input type="date">) to DD/MM/YYYY.
 * Returns an empty string if the input is empty or malformed.
 */
export function isoToDDMMYYYY(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NewAssessmentModalProps {
  /** Called when the user dismisses the modal without creating an assessment. */
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NewAssessmentModal({ onClose }: NewAssessmentModalProps) {
  const router = useRouter();
  const [patientName, setPatientName] = useState("");
  const [assessmentDateISO, setAssessmentDateISO] = useState(todayISO);
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState(false);

  // Focus patient name input on mount
  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = patientName.trim();
    if (!trimmedName) {
      setNameError(true);
      nameInputRef.current?.focus();
      return;
    }

    setSubmitting(true);

    const assessmentDate = isoToDDMMYYYY(assessmentDateISO);

    const saved = saveAssessment({
      syncStatus: "pending",
      status: "in_progress",
      identification: {
        patientName: trimmedName,
        assessmentDate,
        assessmentTools: [],
        examiner: "",
        referralReason: "",
      },
      familyBackground: {},
      developmentalBackground: {},
      developmentalMilestones: {},
      frameworksAndTreatments: {},
    });

    if (!saved) {
      // localStorage unavailable — unlikely but handled gracefully
      setSubmitting(false);
      return;
    }

    // Trigger cloud sync in the background (fire-and-forget).
    // The /assessment/[id] page's useSync hook will also handle retries,
    // so we don't need to await this here.
    fetch(`/api/assessments/${saved.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saved),
    }).catch(() => {
      // Offline — sync will be retried by useSync on the assessment page.
    });

    router.push(`/assessment/${saved.id}`);
  }

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-assessment-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking the backdrop (not the modal itself)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Semi-transparent overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            id="new-assessment-title"
            className="text-lg font-bold text-gray-900"
          >
            הערכה חדשה
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className={[
              "w-11 h-11 flex items-center justify-center rounded-full",
              "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
              "transition-colors duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
            ].join(" ")}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Patient name */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="patient-name"
              className="text-sm font-medium text-gray-700"
            >
              שם המטופל/ת
              <span aria-hidden="true" className="text-red-500 ms-0.5">
                {" "}*
              </span>
            </label>
            <input
              ref={nameInputRef}
              id="patient-name"
              type="text"
              value={patientName}
              onChange={(e) => {
                setPatientName(e.target.value);
                if (nameError) setNameError(false);
              }}
              placeholder="הכנס שם"
              autoComplete="off"
              required
              aria-required="true"
              aria-invalid={nameError}
              aria-describedby={nameError ? "patient-name-error" : undefined}
              className={[
                "w-full rounded-xl border px-4 py-3",
                // Font ≥ 16pt prevents iPad Safari auto-zoom
                "text-[17px] leading-snug text-gray-900",
                "placeholder:text-gray-400",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                "transition-colors duration-150",
                nameError
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-white",
              ].join(" ")}
            />
            {nameError && (
              <p
                id="patient-name-error"
                role="alert"
                className="text-sm text-red-600"
              >
                יש להזין שם מטופל/ת
              </p>
            )}
          </div>

          {/* Assessment date */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="assessment-date"
              className="text-sm font-medium text-gray-700"
            >
              תאריך הערכה
            </label>
            <input
              id="assessment-date"
              type="date"
              value={assessmentDateISO}
              onChange={(e) => setAssessmentDateISO(e.target.value)}
              className={[
                "w-full rounded-xl border border-gray-300 bg-white px-4 py-3",
                // Font ≥ 16pt prevents iPad Safari auto-zoom
                "text-[17px] leading-snug text-gray-900",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                "transition-colors duration-150",
              ].join(" ")}
            />
            {assessmentDateISO && (
              <p className="text-xs text-gray-400 mt-0.5">
                {isoToDDMMYYYY(assessmentDateISO)}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className={[
              "mt-1 w-full rounded-xl py-3 px-6",
              "text-[17px] font-semibold text-white",
              // Touch target height: py-3 + text = ~52px, well above 44px
              "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]",
              "transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            {submitting ? "פותח..." : "התחל הערכה"}
          </button>
        </form>
      </div>
    </div>
  );
}
