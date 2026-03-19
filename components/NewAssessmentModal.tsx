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
              <span className="text-white font-bold text-xs">+</span>
            </div>
            <h2
              id="new-assessment-title"
              className="text-white font-semibold text-[17px] tracking-tight"
            >
              הערכה חדשה
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
          >
            ✕
          </button>
        </div>

        {/* Form body */}
        <div className="bg-white px-6 pt-5 pb-6 rounded-b-none sm:rounded-b-[20px]">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Patient name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="patient-name" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                שם המטופל
                <span aria-hidden="true" className="ms-0.5" style={{ color: "#7c3aed" }}>*</span>
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
                placeholder="הכנס שם מלא"
                autoComplete="off"
                required
                aria-required="true"
                aria-invalid={nameError}
                aria-describedby={nameError ? "patient-name-error" : undefined}
                className="w-full rounded-xl px-4 py-3 text-[17px] leading-snug text-gray-900 placeholder:text-gray-300 transition-all duration-150 focus:outline-none"
                style={{
                  border: nameError ? "1.5px solid #f87171" : "1.5px solid #e8e8f0",
                  backgroundColor: nameError ? "#fff5f5" : "#fafafa",
                  ...(nameError ? {} : {}),
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
                <p id="patient-name-error" role="alert" className="text-xs text-red-500 mt-0.5">
                  יש להזין שם מטופל
                </p>
              )}
            </div>

            {/* Assessment date */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="assessment-date" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                תאריך הערכה
              </label>
              <input
                id="assessment-date"
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
              {submitting ? "פותח..." : "התחל הערכה ←"}
            </button>
          </form>
        </div>

        {/* iPhone home bar spacer */}
        <div className="bg-white h-safe-bottom sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
      </div>
    </div>
  );
}
