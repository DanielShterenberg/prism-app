import {
  saveAssessment,
  updateAssessment,
  getAssessment,
  listAssessments,
  deleteAssessment,
} from "../localStorage";
import type { Assessment } from "@/types/assessment";

// jsdom provides a working localStorage implementation, so most tests
// exercise the happy path.  The "unavailable" suite replaces the global
// with a throwing stub to verify the graceful-fallback behaviour.

const baseData: Omit<Assessment, "id" | "createdAt" | "updatedAt"> = {
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

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// saveAssessment
// ---------------------------------------------------------------------------
describe("saveAssessment", () => {
  it("returns a complete assessment with generated id, createdAt, updatedAt", () => {
    const result = saveAssessment(baseData);
    expect(result).not.toBeNull();
    expect(result!.id).toBeDefined();
    expect(result!.createdAt).toBeDefined();
    expect(result!.updatedAt).toBeDefined();
    expect(result!.identification.patientName).toBe("ילד בדיקה");
  });

  it("persists to localStorage under the correct key", () => {
    const result = saveAssessment(baseData);
    expect(result).not.toBeNull();
    const raw = localStorage.getItem(`prism:assessment:${result!.id}`);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.id).toBe(result!.id);
  });

  it("generates a unique id for each assessment", () => {
    const a = saveAssessment(baseData);
    const b = saveAssessment(baseData);
    expect(a!.id).not.toBe(b!.id);
  });

  it("sets createdAt and updatedAt to the same ISO string on creation", () => {
    const result = saveAssessment(baseData);
    expect(result!.createdAt).toBe(result!.updatedAt);
  });
});

// ---------------------------------------------------------------------------
// getAssessment
// ---------------------------------------------------------------------------
describe("getAssessment", () => {
  it("retrieves a saved assessment by id", () => {
    const saved = saveAssessment(baseData)!;
    const fetched = getAssessment(saved.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(saved.id);
  });

  it("returns null for an unknown id", () => {
    expect(getAssessment("non-existent-id")).toBeNull();
  });

  it("ignores keys that do not belong to an assessment", () => {
    localStorage.setItem("other:key", "value");
    // Should not throw or return the unrelated key
    expect(getAssessment("other:key")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateAssessment
// ---------------------------------------------------------------------------
describe("updateAssessment", () => {
  it("updates the specified fields and bumps updatedAt", async () => {
    const saved = saveAssessment(baseData)!;
    // Ensure at least 1 ms passes so updatedAt is different
    await new Promise((r) => setTimeout(r, 2));
    const updated = updateAssessment(saved.id, { syncStatus: "synced" });
    expect(updated).not.toBeNull();
    expect(updated!.syncStatus).toBe("synced");
    expect(updated!.updatedAt > saved.updatedAt).toBe(true);
  });

  it("does not change id or createdAt", () => {
    const saved = saveAssessment(baseData)!;
    const updated = updateAssessment(saved.id, { status: "completed" });
    expect(updated!.id).toBe(saved.id);
    expect(updated!.createdAt).toBe(saved.createdAt);
  });

  it("returns null for an unknown id", () => {
    expect(updateAssessment("no-such-id", { status: "completed" })).toBeNull();
  });

  it("persists changes to localStorage", () => {
    const saved = saveAssessment(baseData)!;
    updateAssessment(saved.id, { syncStatus: "error" });
    const raw = localStorage.getItem(`prism:assessment:${saved.id}`)!;
    expect(JSON.parse(raw).syncStatus).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// listAssessments
// ---------------------------------------------------------------------------
describe("listAssessments", () => {
  it("returns an empty array when no assessments exist", () => {
    expect(listAssessments()).toEqual([]);
  });

  it("returns all saved assessments", () => {
    saveAssessment(baseData);
    saveAssessment(baseData);
    expect(listAssessments()).toHaveLength(2);
  });

  it("ignores unrelated localStorage keys", () => {
    localStorage.setItem("unrelated:key", "data");
    saveAssessment(baseData);
    expect(listAssessments()).toHaveLength(1);
  });

  it("returns assessments sorted by updatedAt descending", async () => {
    const first = saveAssessment(baseData)!;
    await new Promise((r) => setTimeout(r, 2));
    const second = saveAssessment(baseData)!;
    const list = listAssessments();
    expect(list[0].id).toBe(second.id);
    expect(list[1].id).toBe(first.id);
  });

  it("skips malformed entries without throwing", () => {
    localStorage.setItem("prism:assessment:bad", "not-json{{{");
    saveAssessment(baseData);
    expect(() => listAssessments()).not.toThrow();
    expect(listAssessments()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// deleteAssessment
// ---------------------------------------------------------------------------
describe("deleteAssessment", () => {
  it("removes the assessment and returns true", () => {
    const saved = saveAssessment(baseData)!;
    expect(deleteAssessment(saved.id)).toBe(true);
    expect(getAssessment(saved.id)).toBeNull();
  });

  it("returns false for a non-existent id", () => {
    expect(deleteAssessment("ghost-id")).toBe(false);
  });

  it("does not affect other assessments", () => {
    const a = saveAssessment(baseData)!;
    const b = saveAssessment(baseData)!;
    deleteAssessment(a.id);
    expect(getAssessment(b.id)).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Graceful fallback when localStorage is unavailable
// ---------------------------------------------------------------------------
describe("graceful fallback when localStorage is unavailable", () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
    // Replace localStorage with a stub that always throws
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem() {
          throw new Error("unavailable");
        },
        getItem() {
          throw new Error("unavailable");
        },
        removeItem() {
          throw new Error("unavailable");
        },
        key() {
          throw new Error("unavailable");
        },
        clear() {
          throw new Error("unavailable");
        },
        length: 0,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it("saveAssessment returns null", () => {
    expect(saveAssessment(baseData)).toBeNull();
  });

  it("getAssessment returns null", () => {
    expect(getAssessment("any-id")).toBeNull();
  });

  it("updateAssessment returns null", () => {
    expect(updateAssessment("any-id", { syncStatus: "synced" })).toBeNull();
  });

  it("listAssessments returns empty array", () => {
    expect(listAssessments()).toEqual([]);
  });

  it("deleteAssessment returns false", () => {
    expect(deleteAssessment("any-id")).toBe(false);
  });
});
