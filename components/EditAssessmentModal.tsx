/**
 * EditAssessmentModal — modal for editing patient name and assessment date.
 *
 * Fields:
 *  - Patient name (required)
 *  - Assessment date (date picker, displayed as DD/MM/YYYY)
 *
 * On submit:
 *  1. Updates the Assessment in localStorage via updateAssessment.
 *  2. Calls onSave(updated) so the parent can trigger cloud sync.
 *  3. Closes the modal.
 *
 * Layout: RTL, Hebrew labels.
 * Font size ≥ 16pt on all inputs (prevents iPad Safari auto-zoom).
 * Touch targets ≥ 44px on all interactive elements.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { updateAssessment } from "@/lib/localStorage";
import { isoToDDMMYYYY } from "@/components/NewAssessmentModal";
import type { Assessment } from "@/types/assessment";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts DD/MM/YYYY (stored format) to YYYY-MM-DD (for <input type="date">).
 * Returns an empty string if the input is empty or malformed.
 */
function ddmmyyyyToISO(ddmmyyyy: string): string {
  if (!ddmmyyyy) return "";
  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return "";
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EditAssessmentModalProps {
  /** The assessment to edit. */
  assessment: Assessment;
  /** Called when the user saves changes, with the updated assessment. */
  onSave: (updated: Assessment) => void;
  /** Called when the user dismisses the modal without saving. */
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditAssessmentModal({
  assessment,
  onSave,
  onClose,
}: EditAssessmentModalProps) {
  const currentName = assessment.identification?.patientName ?? "";
  const currentDateDDMMYYYY = assessment.identification?.assessmentDate ?? "";

  const [patientName, setPatientName] = useState(currentName);
  const [assessmentDateISO, setAssessmentDateISO] = useState(
    ddmmyyyyToISO(currentDateDDMMYYYY)
  );
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

    const updated = updateAssessment(assessment.id, {
      identification: {
        ...(assessment.identification ?? {}),
        patientName: trimmedName,
        assessmentDate,
      },
      syncStatus: "pending",
    });

    setSubmitting(false);

    if (!updated) {
      // localStorage unavailable — unlikely but handled gracefully
      onClose();
      return;
    }

    onSave(updated);
    onClose();
  }

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-assessment-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal panel */}
      <div
        className="relative z-10 w-full sm:max-w-[420px] sm:mx-4 flex flex-col"
        style={{ borderRadius: "20px 20px 0 0" }}
      >
        {/* Dark header strip */}
        <div
          className="rounded-t-[20px] px-6 pt-6 pb-5 flex items-center justify-between"
          style={{ backgroundColor: "#09090f" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              {/* Pencil icon */}
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <h2
              id="edit-assessment-title"
              className="text-white font-semibold text-[17px] tracking-tight"
            >
              עריכת פרטי הערכה
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Form body */}
        <div className="bg-white px-6 pt-5 pb-6 rounded-b-none sm:rounded-b-[20px]">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Patient name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-patient-name"
                className="text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                שם המטופל
                <span aria-hidden="true" className="ms-0.5" style={{ color: "#7c3aed" }}>
                  *
                </span>
              </label>
              <input
                ref={nameInputRef}
                id="edit-patient-name"
                type="text"
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  if (nameError) setNameError(false);
                }}
                placeholder="הכנס שם מלא"
                autoComplete="off"
                required
                aria-required="true"
                aria-invalid={nameError}
                aria-describedby={nameError ? "edit-patient-name-error" : undefined}
                className="w-full rounded-xl px-4 py-3 text-[17px] leading-snug text-gray-900 placeholder:text-gray-300 transition-all duration-150 focus:outline-none"
                style={{
                  border: nameError ? "1.5px solid #f87171" : "1.5px solid #e8e8f0",
                  backgroundColor: nameError ? "#fff5f5" : "#fafafa",
                }}
                onFocus={(e) => {
                  if (!nameError) {
                    e.currentTarget.style.border = "1.5px solid #7c3aed";
                    e.currentTarget.style.backgroundColor = "#fff";
                  }
                }}
                onBlur={(e) => {
                  if (!nameError) {
                    e.currentTarget.style.border = "1.5px solid #e8e8f0";
                    e.currentTarget.style.backgroundColor = "#fafafa";
                  }
                }}
              />
              {nameError && (
                <p
                  id="edit-patient-name-error"
                  role="alert"
                  className="text-xs text-red-500 mt-0.5"
                >
                  יש להזין שם מטופל
                </p>
              )}
            </div>

            {/* Assessment date */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-assessment-date"
                className="text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                תאריך הערכה
              </label>
              <input
                id="edit-assessment-date"
                type="date"
                value={assessmentDateISO}
                onChange={(e) => setAssessmentDateISO(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-[17px] leading-snug text-gray-900 transition-all duration-150 focus:outline-none"
                style={{
                  border: "1.5px solid #e8e8f0",
                  backgroundColor: "#fafafa",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1.5px solid #7c3aed";
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1.5px solid #e8e8f0";
                  e.currentTarget.style.backgroundColor = "#fafafa";
                }}
              />
              {assessmentDateISO && (
                <p className="text-xs mt-0.5" style={{ color: "#a0a0b0" }}>
                  {isoToDDMMYYYY(assessmentDateISO)}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded-xl py-3.5 px-6 text-[17px] font-semibold text-white active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              {submitting ? "שומר..." : "שמור שינויים"}
            </button>
          </form>
        </div>

        {/* iPhone home bar spacer */}
        <div
          className="bg-white sm:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        />
      </div>
    </div>
  );
}
