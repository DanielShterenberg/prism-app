"use client";

/**
 * Summary screen — /assessment/[id]/summary
 *
 * A read-only view of a completed assessment, grouped by block (A–E).
 * Empty fields are skipped — no blank labels shown.
 *
 * Actions:
 *  - "סמן כהושלם" (Mark as Completed) → sets status = 'completed', triggers sync
 *  - "עריכה" (Edit) → navigates back to /assessment/[id]
 *  - "ייצוא / שיתוף" (Export / Share) → disabled, tooltip "בקרוב בגרסה 2"
 *
 * Data:
 *  - Loaded from localStorage immediately via useAssessment (offline-first).
 *  - If not found, shows an error with a link back to the list.
 *
 * Layout: RTL inherited from root <html dir="rtl">.
 * Touch targets ≥ 44px on all interactive elements.
 * Font size ≥ 16px on all text (no inputs on this screen — all read-only).
 */

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAssessment } from "@/hooks/useAssessment";
import { useSync } from "@/hooks/useSync";
import { updateAssessment } from "@/lib/localStorage";
import type {
  Assessment,
  Identification,
  FamilyBackground,
  DevelopmentalBackground,
  DevelopmentalMilestones,
  FrameworksAndTreatments,
} from "@/types/assessment";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldEntry {
  label: string;
  value: string;
}

interface BlockSummary {
  id: string;
  letter: string;
  title: string;
  fields: FieldEntry[];
}

// ---------------------------------------------------------------------------
// Field extraction helpers
// ---------------------------------------------------------------------------

/**
 * Returns a non-empty string value, or null if empty / undefined.
 */
function nonEmpty(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Extracts filled fields from Block A (Identification).
 */
function extractBlockA(data: Identification): FieldEntry[] {
  const fields: FieldEntry[] = [];

  const patientName = nonEmpty(data.patientName);
  if (patientName) fields.push({ label: "שם המטופל/ת", value: patientName });

  const dob = nonEmpty(data.dateOfBirth);
  if (dob) fields.push({ label: "תאריך לידה", value: dob });

  const framework = nonEmpty(data.educationalFramework);
  if (framework) fields.push({ label: "מסגרת חינוכית", value: framework });

  const assessmentDate = nonEmpty(data.assessmentDate);
  if (assessmentDate)
    fields.push({ label: "תאריך הערכה", value: assessmentDate });

  if (data.assessmentTools && data.assessmentTools.length > 0) {
    fields.push({
      label: "כלי הערכה",
      value: data.assessmentTools.join(", "),
    });
  }

  const examiner = nonEmpty(data.examiner);
  if (examiner) fields.push({ label: "בודק/ת", value: examiner });

  const referralReason = nonEmpty(data.referralReason);
  if (referralReason)
    fields.push({ label: "סיבת הפניה", value: referralReason });

  return fields;
}

/**
 * Extracts filled fields from Block B (Family Background).
 */
function extractBlockB(data: FamilyBackground): FieldEntry[] {
  const fields: FieldEntry[] = [];

  const father = nonEmpty(data.father);
  if (father) fields.push({ label: "אב", value: father });

  const mother = nonEmpty(data.mother);
  if (mother) fields.push({ label: "אם", value: mother });

  const parentStatus = nonEmpty(data.parentStatus);
  if (parentStatus) fields.push({ label: "מצב הורים", value: parentStatus });

  const city = nonEmpty(data.city);
  if (city) fields.push({ label: "עיר", value: city });

  const siblings = nonEmpty(data.siblings);
  if (siblings) fields.push({ label: "אחים/אחיות", value: siblings });

  const familyDiagnoses = nonEmpty(data.familyDiagnoses);
  if (familyDiagnoses)
    fields.push({ label: "אבחנות במשפחה", value: familyDiagnoses });

  return fields;
}

/**
 * Extracts filled fields from Block C (Developmental Background).
 */
function extractBlockC(data: DevelopmentalBackground): FieldEntry[] {
  const fields: FieldEntry[] = [];

  const pregnancy = nonEmpty(data.pregnancy);
  if (pregnancy) fields.push({ label: "הריון", value: pregnancy });

  const pregnancyCourse = nonEmpty(data.pregnancyCourse);
  if (pregnancyCourse)
    fields.push({ label: "מהלך ההריון", value: pregnancyCourse });

  const birth = nonEmpty(data.birth);
  if (birth) fields.push({ label: "לידה", value: birth });

  const medicalProcedures = nonEmpty(data.medicalProcedures);
  if (medicalProcedures)
    fields.push({ label: "פרוצדורות רפואיות", value: medicalProcedures });

  const breastfeeding = nonEmpty(data.breastfeeding);
  if (breastfeeding) fields.push({ label: "הנקה", value: breastfeeding });

  const firstYearDifficulties = nonEmpty(data.firstYearDifficulties);
  if (firstYearDifficulties)
    fields.push({
      label: "קשיים בשנה הראשונה",
      value: firstYearDifficulties,
    });

  return fields;
}

/**
 * Extracts filled fields from Block D (Developmental Milestones).
 */
function extractBlockD(data: DevelopmentalMilestones): FieldEntry[] {
  const fields: FieldEntry[] = [];

  // Age fields
  const firstWordsAge = nonEmpty(data.firstWordsAge);
  if (firstWordsAge)
    fields.push({ label: "מילה ראשונה", value: firstWordsAge });

  const wordPairsAge = nonEmpty(data.wordPairsAge);
  if (wordPairsAge) fields.push({ label: "צמד מילים", value: wordPairsAge });

  const sentencesAge = nonEmpty(data.sentencesAge);
  if (sentencesAge) fields.push({ label: "משפטים", value: sentencesAge });

  const independentWalkingAge = nonEmpty(data.independentWalkingAge);
  if (independentWalkingAge)
    fields.push({ label: "הליכה עצמאית", value: independentWalkingAge });

  const bikeRidingAge = nonEmpty(data.bikeRidingAge);
  if (bikeRidingAge)
    fields.push({ label: "רכיבה על אופניים", value: bikeRidingAge });

  const bladderControlDay = nonEmpty(data.bladderControlDay);
  if (bladderControlDay)
    fields.push({
      label: "שליטה בסוגרים — יום",
      value: bladderControlDay,
    });

  const bladderControlNight = nonEmpty(data.bladderControlNight);
  if (bladderControlNight)
    fields.push({
      label: "שליטה בסוגרים — לילה",
      value: bladderControlNight,
    });

  const bowelControl = nonEmpty(data.bowelControl);
  if (bowelControl)
    fields.push({ label: "שליטה במעיים", value: bowelControl });

  // Narrative textarea fields
  const languageRegression = nonEmpty(data.languageRegression);
  if (languageRegression)
    fields.push({ label: "רגרסיה בשפה", value: languageRegression });

  const motorClumsiness = nonEmpty(data.motorClumsiness);
  if (motorClumsiness)
    fields.push({ label: "מגושמות מוטורית", value: motorClumsiness });

  const fallsTendency = nonEmpty(data.fallsTendency);
  if (fallsTendency) fields.push({ label: "נפילות", value: fallsTendency });

  const climbing = nonEmpty(data.climbing);
  if (climbing) fields.push({ label: "טיפוס", value: climbing });

  const eating = nonEmpty(data.eating);
  if (eating) fields.push({ label: "אכילה", value: eating });

  const sleep = nonEmpty(data.sleep);
  if (sleep) fields.push({ label: "שינה", value: sleep });

  const sensoryRegulation = nonEmpty(data.sensoryRegulation);
  if (sensoryRegulation)
    fields.push({ label: "ויסות חושי", value: sensoryRegulation });

  const emotionalRegulation = nonEmpty(data.emotionalRegulation);
  if (emotionalRegulation)
    fields.push({ label: "ויסות רגשי", value: emotionalRegulation });

  return fields;
}

/**
 * Extracts filled fields from Block E (Frameworks & Treatments).
 */
function extractBlockE(data: FrameworksAndTreatments): FieldEntry[] {
  const fields: FieldEntry[] = [];

  const educationalFrameworks = nonEmpty(data.educationalFrameworks);
  if (educationalFrameworks)
    fields.push({ label: "מסגרות חינוכיות", value: educationalFrameworks });

  const treatments = nonEmpty(data.treatments);
  if (treatments) fields.push({ label: "טיפולים", value: treatments });

  const previousAssessments = nonEmpty(data.previousAssessments);
  if (previousAssessments)
    fields.push({ label: "הערכות קודמות", value: previousAssessments });

  const treatmentStaffCommunication = nonEmpty(
    data.treatmentStaffCommunication
  );
  if (treatmentStaffCommunication)
    fields.push({
      label: "תקשורת עם צוות טיפולי",
      value: treatmentStaffCommunication,
    });

  return fields;
}

/**
 * Builds the full block summary list from an assessment.
 * Blocks with no filled fields are omitted.
 */
function buildBlockSummaries(assessment: Assessment): BlockSummary[] {
  const all: BlockSummary[] = [
    {
      id: "A",
      letter: "א",
      title: "זיהוי מטופל",
      fields: extractBlockA(assessment.identification),
    },
    {
      id: "B",
      letter: "ב",
      title: "רקע משפחתי",
      fields: extractBlockB(assessment.familyBackground),
    },
    {
      id: "C",
      letter: "ג",
      title: "רקע התפתחותי",
      fields: extractBlockC(assessment.developmentalBackground),
    },
    {
      id: "D",
      letter: "ד",
      title: "אבני דרך התפתחותיות",
      fields: extractBlockD(assessment.developmentalMilestones),
    },
    {
      id: "E",
      letter: "ה",
      title: "מסגרות וטיפולים",
      fields: extractBlockE(assessment.frameworksAndTreatments),
    },
  ];

  // Skip blocks with no filled fields
  return all.filter((block) => block.fields.length > 0);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * A single block section in the summary — heading + field rows.
 */
function BlockSection({ block }: { block: BlockSummary }) {
  return (
    <section aria-labelledby={`summary-block-${block.id}`}>
      <h2
        id={`summary-block-${block.id}`}
        className="text-[15px] font-semibold text-gray-500 uppercase tracking-wide mb-3"
      >
        בלוק {block.letter} — {block.title}
      </h2>
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm divide-y divide-gray-100">
        {block.fields.map((field) => (
          <div key={field.label} className="px-5 py-4">
            <p className="text-[13px] font-medium text-gray-500 mb-1">
              {field.label}
            </p>
            <p className="text-[17px] text-gray-900 leading-relaxed whitespace-pre-wrap">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const { assessment, notFound, refresh } = useAssessment(id);

  // Local state to track if "Mark as Completed" is in progress
  const [isCompleting, setIsCompleting] = useState(false);

  // Snapshot passed to useSync — set when Mark as Completed is pressed
  const [syncSnapshot, setSyncSnapshot] = useState<Assessment | null>(null);

  useSync({
    assessment: syncSnapshot,
    onSyncStatusChange: () => {
      refresh();
    },
  });

  const handleMarkCompleted = useCallback(() => {
    if (!assessment || isCompleting) return;
    setIsCompleting(true);

    const updated = updateAssessment(id, {
      status: "completed",
      syncStatus: "pending",
    });

    if (updated) {
      setSyncSnapshot(updated);
      refresh();
    }

    setIsCompleting(false);
  }, [assessment, id, isCompleting, refresh]);

  function handleEdit() {
    router.push(`/assessment/${id}`);
  }

  // -------------------------------------------------------------------------
  // Not found state
  // -------------------------------------------------------------------------

  if (notFound || !assessment) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-gray-600 text-lg">הערכה לא נמצאה.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className={[
            "rounded-xl bg-blue-600 text-white px-6 py-3",
            "text-[17px] font-medium",
            "hover:bg-blue-700 active:scale-[0.98] transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
            "min-h-[48px]",
          ].join(" ")}
        >
          חזרה לרשימה
        </button>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------

  const patientName = assessment.identification?.patientName || "ללא שם";
  const assessmentDate = assessment.identification?.assessmentDate || "";
  const isCompleted = assessment.status === "completed";
  const blockSummaries = buildBlockSummaries(assessment);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Back button — navigates to /assessment/[id] */}
            <button
              type="button"
              onClick={handleEdit}
              aria-label="חזרה לטופס"
              className={[
                "w-11 h-11 flex items-center justify-center rounded-full",
                "text-gray-500 hover:text-gray-800 hover:bg-gray-100",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                "flex-shrink-0",
              ].join(" ")}
            >
              {/* Right-pointing chevron — in RTL this visually points "back" (to the right) */}
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-[17px] font-bold text-gray-900 leading-snug truncate">
                {patientName}
              </h1>
              <p className="text-sm text-gray-500 leading-tight mt-0.5">
                {assessmentDate ? `${assessmentDate} · ` : ""}
                סיכום ערכה
              </p>
            </div>

            {/* Completed badge */}
            {isCompleted && (
              <span
                className={[
                  "flex-shrink-0 inline-flex items-center gap-1",
                  "rounded-full bg-green-100 text-green-700",
                  "px-3 py-1 text-[13px] font-medium",
                ].join(" ")}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1.5,6 4.5,9 10.5,3" />
                </svg>
                הושלם
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                              */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-48">
        {blockSummaries.length === 0 ? (
          /* Empty state — no fields filled at all */
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8 text-center">
            <p className="text-gray-500 text-[17px]">
              לא הוזנו נתונים בטופס.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {blockSummaries.map((block) => (
              <BlockSection key={block.id} block={block} />
            ))}
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Action bar — fixed at the bottom                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="fixed bottom-0 inset-x-0 z-10 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            {/* ------------------------------------------------------------ */}
            {/* Edit button                                                    */}
            {/* ------------------------------------------------------------ */}
            <button
              type="button"
              onClick={handleEdit}
              className={[
                "flex-1 rounded-xl border border-gray-300 bg-white text-gray-700",
                "py-3 px-4",
                "text-[17px] font-medium",
                "min-h-[52px]",
                "hover:bg-gray-50 active:scale-[0.99] transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
              ].join(" ")}
            >
              עריכה
            </button>

            {/* ------------------------------------------------------------ */}
            {/* Export / Share button — disabled in v1                         */}
            {/* ------------------------------------------------------------ */}
            <div className="relative flex-shrink-0 group">
              <button
                type="button"
                disabled
                aria-disabled="true"
                aria-label='ייצוא / שיתוף — בקרוב בגרסה 2'
                className={[
                  "rounded-xl border border-gray-200 bg-gray-100 text-gray-400",
                  "py-3 px-4",
                  "text-[17px] font-medium",
                  "min-h-[52px]",
                  "cursor-not-allowed",
                  "focus:outline-none",
                ].join(" ")}
              >
                ייצוא
              </button>
              {/* Tooltip */}
              <div
                role="tooltip"
                className={[
                  "absolute bottom-full mb-2 right-0",
                  "px-3 py-1.5 rounded-lg",
                  "bg-gray-800 text-white text-[13px] whitespace-nowrap",
                  "opacity-0 group-hover:opacity-100 pointer-events-none",
                  "transition-opacity duration-150",
                ].join(" ")}
              >
                בקרוב בגרסה 2
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Mark as Completed button                                       */}
            {/* ------------------------------------------------------------ */}
            <button
              type="button"
              onClick={handleMarkCompleted}
              disabled={isCompleted || isCompleting}
              aria-disabled={isCompleted || isCompleting}
              className={[
                "flex-1 rounded-xl text-white",
                "py-3 px-4",
                "text-[17px] font-semibold",
                "min-h-[52px]",
                isCompleted || isCompleting
                  ? "bg-green-400 cursor-default"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
              ].join(" ")}
            >
              {isCompleted ? "הושלם" : "סמן כהושלם"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
