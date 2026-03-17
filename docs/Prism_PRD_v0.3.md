# Prism — ASD Assessment App
### Product Requirements Document | v0.3 | March 2026

---

## 1. Background & Purpose

### The Problem
Clinical psychologists conducting ASD assessments are required to fill in large amounts of structured and open-ended forms during sessions. Today this is done on paper, and many assessors avoid laptops due to the social awkwardness of typing in front of the family. The result: significant time lost before and after sessions, and unsynchronized data.

### The Solution
Build a web-based application that lets the assessor manage all stages of an ASD assessment digitally — comfortably, quickly, and without social awkwardness in front of parents or the patient.

### Vision
A tool that looks and feels like a digital doctor's notepad: clean, professional, and minimal — not a clunky enterprise medical system.

### Primary User: Ynam
A clinical psychologist running his own private clinic, conducting ASD assessments. Uses an iPad during sessions and a Mac/PC for follow-up work. His core frustration is the amount of paperwork involved in each assessment.

---

## 2. App Identity

| Property | Value |
|----------|-------|
| **Name** | Prism |
| **Rationale** | Short, meaningful (autism spectrum reference), works in Hebrew and English, strong visual potential as a logo |
| **Primary Color** | Blue / Navy — trustworthy, clinical, calm |
| **Secondary Color** | White / Light grey backgrounds |
| **Accent** | Warm blue or teal for CTAs and highlights |
| **Typography** | Inter or DM Sans — modern sans-serif, excellent Hebrew and English support |
| **Feel** | Minimal, focused, no clutter — think Notion meets a medical app |

---

## 3. Target Users

### v1 — Primary: Ynam (Clinical Psychologist)
- Manages the full assessment himself
- Uses iPad in-session, Mac/desktop for post-session editing and export
- Needs: speed, large comfortable input fields, minimal friction

### Future Users (post-v1)
- Other clinical psychologists at private clinics
- Health funds (Clalit, Maccabi)
- Multi-assessor clinics (requires roles and permissions)

---

## 4. Version Roadmap

| Version | Description | Status |
|---------|-------------|--------|
| **v1 — MVP** | Anamnesis only — interview management + cloud save | **This PRD** |
| v2 | Structured export (PDF / Word report) | Planned |
| v3 | AI-generated report | Planned |
| v2+ | ADI-R, WISC-IV, ABAS-2, ADOS note-taking | Future |
| Post-MVP | Apple Pencil / handwriting input | Deferred — see §10 |

---

## 5. Platform Strategy

### Decision: Web-First

Prism is built as a **web application** — not a native iOS/iPad app.

**Rationale:**
- With Apple Pencil/handwriting deferred, there are no hard iPad-specific features that require native APIs
- A responsive web app in iPad Safari covers all in-session use cases comfortably
- Same codebase serves iPad, desktop, and mobile browsers
- No TestFlight, no App Store review, no EAS Build complexity
- Faster to ship; Ynam gets access by simply opening a URL

**Platform priority:**

| Platform | Priority | Version |
|----------|----------|---------|
| iPad Safari | First | v1 |
| Web Desktop (Mac/PC) | First | v1 |
| Mobile browser | Second | v2 |

### Future Native Path (documented for reference)
If Apple Pencil handwriting support becomes a priority post-MVP, the recommended path is:
- React Native (Expo) for iPad + Web from a single codebase
- PencilKit for stroke capture (`expo-pencilkit-ui` or `react-native-pencil-kit`)
- Google ML Kit Digital Ink Recognition for Hebrew handwriting-to-text — the only production-quality option (Apple Scribble does not support Hebrew as of iPadOS 26)
- Requires custom Expo native modules in Swift + EAS Build

The web React architecture should keep UI layer separated from business logic so that a future migration to React Native does not require rewriting core logic.

### Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Routing | Next.js (handles SSR if needed later) |
| Backend | Node.js on Railway |
| Database | PostgreSQL on Railway |
| Frontend hosting | Vercel |
| Auth | TBD — Clerk or Auth.js |

---

## 6. Architecture: Offline-First with Cloud Sync

### Decision
Prism uses an **offline-first** architecture: data is saved locally in the browser first, then synced to the cloud. This handles network interruptions gracefully and makes the app feel instant even on poor clinic Wi-Fi.

### How It Works

```
User types
    ↓
Save to localStorage / IndexedDB immediately (no delay)
    ↓
Background sync to cloud API (debounced ~1 second)
    ↓ on failure
Queue locally → retry automatically on reconnect
    ↓ on success
Mark as synced, update cloud DB
```

### Sync Status
Each assessment tracks a sync status:
- `synced` — matches cloud
- `pending` — local changes not yet uploaded
- `error` — sync failed, showing retry prompt

### Conflict Resolution (v1)
Last-write-wins. Since v1 is single-user, conflicts are unlikely. Multi-device conflict resolution is a v2+ concern.

---

## 7. Data Model

```typescript
interface Assessment {
  id: string;                          // uuid
  createdAt: string;                   // ISO date
  updatedAt: string;                   // ISO date
  syncedAt?: string;                   // last successful cloud sync
  syncStatus: 'synced' | 'pending' | 'error';
  status: 'in_progress' | 'completed';

  identification: {
    patientName: string;
    dateOfBirth?: string;
    educationalFramework?: string;
    assessmentDate: string;
    assessmentTools: string[];
    examiner: string;
    referralReason: string;
  };

  familyBackground: {
    father?: string;
    mother?: string;
    parentStatus?: string;
    city?: string;
    siblings?: string;
    familyDiagnoses?: string;
  };

  developmentalBackground: {
    pregnancy?: string;
    pregnancyCourse?: string;
    birth?: string;
    medicalProcedures?: string;
    breastfeeding?: string;
    firstYearDifficulties?: string;
  };

  developmentalMilestones: {
    firstWordsAge?: string;
    wordPairsAge?: string;
    sentencesAge?: string;
    languageRegression?: string;
    independentWalkingAge?: string;
    motorClumsiness?: string;
    fallsTendency?: string;
    climbing?: string;
    bikeRidingAge?: string;
    bladderControlDay?: string;
    bladderControlNight?: string;
    bowelControl?: string;
    eating?: string;
    sleep?: string;
    sensoryRegulation?: string;
    emotionalRegulation?: string;
  };

  frameworksAndTreatments: {
    educationalFrameworks?: string;
    treatments?: string;
    previousAssessments?: string;
    treatmentStaffCommunication?: string;
  };
}
```

---

## 8. v1 Scope: Anamnesis

### What is Anamnesis?
A structured parent interview at the start of an assessment. Ynam types while talking to the parents. Fields are primarily free-text — this is not a closed-question form like ADI-R.

### Sections

**Block A — Patient Identification**
Patient name, date of birth, educational framework, assessment date (default: today), assessment tools (multi-select), examiner, referral reason.

**Block B — Family Background**
Father, mother, parent status, city, siblings, family diagnoses.

**Block C — Developmental Background**
Pregnancy, course of pregnancy, birth, medical procedures, breastfeeding, difficulties in first year.

**Block D — Developmental Milestones**
Short age fields: first words, word pairs, sentences, independent walking, bladder/bowel control.
Textarea fields: language regression, motor clumsiness, falls, climbing, bike riding, eating, sleep, sensory regulation, emotional regulation.

**Block E — Frameworks & Treatments**
Educational frameworks, treatments, prior assessments, communication with treatment staff.

---

## 9. UX Design Decisions

### Home Screen
Each assessment card shows: patient name, assessment date, status badge (In Progress / Completed), and a progress indicator (how many blocks have been started).

> **Decision:** Include progress bar from day one — useful signal, easy to remove later if Ynam finds it distracting.

### Focus Mode — Full Block on Screen

**Decision:** When Ynam enters a section, all fields in that block are visible and scrollable. He navigates between blocks (A → B → C...) using a tab bar at the top.

**Rationale:** A one-field-at-a-time wizard is more focused but slower to navigate, especially when jumping back to fix something mid-interview. Full block gives more control.

**Discussion documented:** If Ynam finds the full-block approach overwhelming in practice, switching to one-field-at-a-time is a self-contained UI change with no impact on data model or sync logic.

### Input Design
- Textarea fields expand dynamically as content grows
- Minimum font size: 16pt (prevents iPad Safari auto-zoom on focus)
- Touch targets: minimum 44px on all interactive elements
- Auto-save: immediate local save on every keystroke; cloud sync debounced at 1 second
- Sync indicator: subtle "Saved / Saving... / Offline — will sync when connected" in the top corner

### RTL Support
- Full RTL layout for Hebrew
- Hebrew-first keyboard on iPad Safari
- Date format: DD/MM/YYYY

---

## 10. Non-Goals (v1)

- No patient management / profiles
- No PDF / Word export (v2)
- No AI report generation (v3)
- No ADI-R, ADOS-2, WISC-IV structured forms (v2+)
- No multi-user / roles / permissions
- No Apple Pencil / handwriting input (post-MVP — see §11)
- No HIPAA compliance certification (v1 = personal tool for Ynam)
- No search or filtering (up to ~50 assessments in v1)
- No native iOS app (web-first — future native path documented in §5)

---

## 11. Deferred: Apple Pencil & Hebrew Handwriting

### Why Deferred
Real-time Hebrew handwriting recognition on iPad is technically possible but adds significant complexity that is out of scope for MVP:

- Apple Scribble **does not support Hebrew** as of iPadOS 26. Arabic was added in iPadOS 17, but Hebrew has no announced timeline.
- The only viable option is **Google ML Kit Digital Ink Recognition** — free, on-device, supports Hebrew (`he` BCP-47), same engine as Gboard handwriting keyboard.
- Implementation requires custom native Swift modules and EAS Build — a major departure from a web-first approach.
- Hebrew handwriting recognition is structurally harder than English: near-identical letter pairs (ב/כ, ד/ר, ח/ה), 5 sofit forms, cursive vs. block script divergence, limited training data.

### Post-MVP Path (documented for future reference)
1. Evaluate whether to extend the web app (limited — Web Ink API is not mature on iPadOS) or migrate key screens to React Native
2. If React Native: use `react-native-pencil-kit` for stroke capture + custom Expo native module wrapping ML Kit Digital Ink iOS SDK
3. Test recognition accuracy with Ynam's own handwriting before committing
4. Estimated effort: 2–3 sprints including native module, canvas UI, and accuracy tuning

---

## 12. Open Questions (for Ynam)

1. **Patient privacy:** Is first name + last initial sufficient for v1, or does he need full name?
2. **Assessment tools field:** Fixed multi-select list, or free text, or both?
3. **Offline scenario:** Does Ynam ever work in a location with no internet at all (not just slow)?

---

## 13. Future Versions (reference)

**v2 — Structured Export:** PDF/Word report with anamnesis data formatted. Legal/licensing review required before including ADI-R or ADOS-2 content (owned by Western Psychological Services).

**v2+ — ADI-R:** All 93 items with question text, per-item scoring, automatic domain score calculation. ⚠️ Commercially licensed — legal clearance required before commercial use.

**v2+ — ADOS-2 Notes:** Minimal in-session checkbox screen (Ynam cannot type during ADOS — he is moving around the room). Full scoring done post-session.

**v3 — AI Report:** Send all session data to Claude/GPT, generate a chronological integrative report draft, edit in-app.

**vSaaS — Multi-Tenant:** Login/workspace per clinic, assessment sharing, billing for clinics and health funds.

---

*Version: 0.3 | March 2026 | Co-authored with Claude*
