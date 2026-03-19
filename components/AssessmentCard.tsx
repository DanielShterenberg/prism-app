import React from "react";
import type { Assessment, AssessmentStatus, SyncStatus } from "@/types/assessment";

const TOTAL_BLOCKS = 5;

const STATUS_LABEL: Record<AssessmentStatus, string> = {
  in_progress: "בתהליך",
  completed: "הושלם",
};

const STATUS_STYLE: Record<AssessmentStatus, string> = {
  in_progress: "bg-violet-50 text-violet-700",
  completed: "bg-emerald-50 text-emerald-700",
};

const SYNC_DOT_STYLE: Record<SyncStatus, string> = {
  synced: "bg-emerald-400",
  pending: "bg-amber-400 animate-pulse",
  error: "bg-red-400",
};

const SYNC_ARIA: Record<SyncStatus, string> = {
  synced: "נשמר בענן",
  pending: "מסנכרן...",
  error: "שמור מקומית בלבד",
};

function countFilledBlocks(assessment: Assessment): number {
  const blocks = [
    assessment.identification,
    assessment.familyBackground,
    assessment.developmentalBackground,
    assessment.developmentalMilestones,
    assessment.frameworksAndTreatments,
  ];
  return blocks.filter((block) => {
    if (!block) return false;
    return Object.values(block).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && String(v).trim() !== "";
    });
  }).length;
}

export interface AssessmentCardProps {
  assessment: Assessment;
  onClick?: (id: string) => void;
}

export function AssessmentCard({ assessment, onClick }: AssessmentCardProps) {
  const filledBlocks = countFilledBlocks(assessment);
  const patientName = assessment.identification?.patientName || "ללא שם";
  const assessmentDate = assessment.identification?.assessmentDate || "";

  return (
    <button
      type="button"
      onClick={() => onClick?.(assessment.id)}
      className="w-full text-right bg-white rounded-xl min-h-[88px] px-5 py-4 flex flex-col gap-2.5 transition-all duration-150 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer"
      style={{
        border: "1px solid #e8e8f0",
        borderRightWidth: "3px",
        borderRightColor: "#7c3aed",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(124,58,237,0.12)";
        (e.currentTarget as HTMLElement).style.borderColor = "#c4b5fd";
        (e.currentTarget as HTMLElement).style.borderRightColor = "#7c3aed";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "#e8e8f0";
        (e.currentTarget as HTMLElement).style.borderRightColor = "#7c3aed";
      }}
      aria-label={`הערכה של ${patientName}, ${assessmentDate}`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[17px] font-semibold text-gray-900 leading-snug">{patientName}</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          {assessmentDate && (
            <span className="text-xs text-gray-400" style={{ fontVariantNumeric: "tabular-nums" }}>
              {assessmentDate}
            </span>
          )}
          <span
            role="status"
            aria-label={SYNC_ARIA[assessment.syncStatus]}
            className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${SYNC_DOT_STYLE[assessment.syncStatus]}`}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_STYLE[assessment.status]}`}>
          {STATUS_LABEL[assessment.status]}
        </span>

        {/* Progress dots */}
        <div className="flex gap-1 me-auto" aria-label={`${filledBlocks} מתוך ${TOTAL_BLOCKS} בלוקים`}>
          {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-colors"
              style={{ backgroundColor: i < filledBlocks ? "#7c3aed" : "#e2e2ee" }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

export default AssessmentCard;
