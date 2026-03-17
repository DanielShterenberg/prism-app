// Sync status for offline-first cloud sync
export type SyncStatus = "synced" | "pending" | "error";

// Assessment lifecycle status
export type AssessmentStatus = "in_progress" | "completed";

// Block A — Patient Identification
export interface Identification {
  patientName: string;
  dateOfBirth?: string; // DD/MM/YYYY
  educationalFramework?: string;
  assessmentDate: string; // DD/MM/YYYY
  assessmentTools: string[];
  examiner: string;
  referralReason: string;
}

// Block B — Family Background
export interface FamilyBackground {
  father?: string;
  mother?: string;
  parentStatus?: string;
  city?: string;
  siblings?: string;
  familyDiagnoses?: string;
}

// Block C — Developmental Background
export interface DevelopmentalBackground {
  pregnancy?: string;
  pregnancyCourse?: string;
  birth?: string;
  medicalProcedures?: string;
  breastfeeding?: string;
  firstYearDifficulties?: string;
}

// Block D — Developmental Milestones
export interface DevelopmentalMilestones {
  // Age fields (compact inline inputs)
  firstWordsAge?: string;
  wordPairsAge?: string;
  sentencesAge?: string;
  independentWalkingAge?: string;
  bikeRidingAge?: string;
  bladderControlDay?: string;
  bladderControlNight?: string;
  bowelControl?: string;
  // Textarea fields
  languageRegression?: string;
  motorClumsiness?: string;
  fallsTendency?: string;
  climbing?: string;
  eating?: string;
  sleep?: string;
  sensoryRegulation?: string;
  emotionalRegulation?: string;
}

// Block E — Frameworks & Treatments
export interface FrameworksAndTreatments {
  educationalFrameworks?: string;
  treatments?: string;
  previousAssessments?: string;
  treatmentStaffCommunication?: string;
}

// Root Assessment type — single source of truth
export interface Assessment {
  id: string; // uuid
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  syncedAt?: string; // ISO date string — last successful cloud sync
  syncStatus: SyncStatus;
  status: AssessmentStatus;

  identification: Identification;
  familyBackground: FamilyBackground;
  developmentalBackground: DevelopmentalBackground;
  developmentalMilestones: DevelopmentalMilestones;
  frameworksAndTreatments: FrameworksAndTreatments;
}
