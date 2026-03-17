import type {
  Assessment,
  AssessmentStatus,
  SyncStatus,
  Identification,
  FamilyBackground,
  DevelopmentalBackground,
  DevelopmentalMilestones,
  FrameworksAndTreatments,
} from "../assessment";

// Compile-time checks: ensure all types are exported and structurally correct.
// These tests will fail to compile if any type is missing or malformed.

describe("Assessment types", () => {
  it("SyncStatus accepts valid values", () => {
    const synced: SyncStatus = "synced";
    const pending: SyncStatus = "pending";
    const error: SyncStatus = "error";
    expect([synced, pending, error]).toHaveLength(3);
  });

  it("AssessmentStatus accepts valid values", () => {
    const inProgress: AssessmentStatus = "in_progress";
    const completed: AssessmentStatus = "completed";
    expect([inProgress, completed]).toHaveLength(2);
  });

  it("Assessment interface has required fields", () => {
    const assessment: Assessment = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      createdAt: "2026-03-18T00:00:00.000Z",
      updatedAt: "2026-03-18T00:00:00.000Z",
      syncStatus: "pending",
      status: "in_progress",
      identification: {
        patientName: "ילד בדיקה",
        assessmentDate: "18/03/2026",
        assessmentTools: [],
        examiner: "ינם",
        referralReason: "הפניה לבדיקה",
      },
      familyBackground: {},
      developmentalBackground: {},
      developmentalMilestones: {},
      frameworksAndTreatments: {},
    };
    expect(assessment.id).toBeDefined();
    expect(assessment.syncStatus).toBe("pending");
    expect(assessment.status).toBe("in_progress");
    expect(assessment.identification.patientName).toBe("ילד בדיקה");
  });

  it("all sub-type interfaces are exported", () => {
    // TypeScript will fail to compile if any of these imports are missing
    const _types: [
      typeof Identification,
      typeof FamilyBackground,
      typeof DevelopmentalBackground,
      typeof DevelopmentalMilestones,
      typeof FrameworksAndTreatments,
    ] = [
      {} as Identification,
      {} as FamilyBackground,
      {} as DevelopmentalBackground,
      {} as DevelopmentalMilestones,
      {} as FrameworksAndTreatments,
    ];
    expect(_types).toHaveLength(5);
  });
});
