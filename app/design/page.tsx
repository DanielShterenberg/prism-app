/**
 * /design — Prism design system preview page.
 *
 * Displays all design tokens (colors, typography) and component variants
 * in one place. Used during development for visual QA.
 * Not linked from the main nav — access directly via /design.
 *
 * All labels are in Hebrew (RTL layout inherited from root).
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Color swatch
// ---------------------------------------------------------------------------

function Swatch({
  label,
  cssVar,
  textClass = "text-white",
}: {
  label: string;
  cssVar: string;
  textClass?: string;
}) {
  return (
    <div
      className={[
        "flex items-end p-3 rounded-xl min-h-[80px]",
        "text-xs font-mono",
        textClass,
      ].join(" ")}
      style={{ background: `var(${cssVar})` }}
    >
      <div>
        <p className="font-semibold">{label}</p>
        <p className="opacity-75">{cssVar}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DesignPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");

  const previewTabs = [
    { id: "colors", label: "צבעים" },
    { id: "typography", label: "טיפוגרפיה" },
    { id: "components", label: "רכיבים" },
  ];

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Prism — מערכת עיצוב
          </h1>
          <p className="text-foreground-muted mt-1">
            תצוגה מקדימה של אסימוני עיצוב ורכיבי ממשק
          </p>
        </div>

        {/* Tab navigation */}
        <Tabs
          tabs={previewTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {/* ── Colors ─────────────────────────────────────────────────── */}
          {activeTab === "colors" && (
            <div className="flex flex-col gap-8 pt-6">
              <Section title="צבעים עיקריים">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Swatch label="Primary" cssVar="--primary" />
                  <Swatch label="Primary Light" cssVar="--primary-light" textClass="text-primary" />
                  <Swatch label="Accent" cssVar="--accent" />
                  <Swatch label="Accent Light" cssVar="--accent-light" textClass="text-accent" />
                </div>
              </Section>

              <Section title="צבעים סמנטיים">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Swatch label="Success" cssVar="--success" />
                  <Swatch label="Warning" cssVar="--warning" />
                  <Swatch label="Error" cssVar="--error" />
                  <Swatch label="Success Light" cssVar="--success-light" textClass="text-success-foreground" />
                  <Swatch label="Warning Light" cssVar="--warning-light" textClass="text-warning-foreground" />
                  <Swatch label="Error Light" cssVar="--error-light" textClass="text-error-foreground" />
                </div>
              </Section>

              <Section title="ניטרלים ורקע">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Swatch label="Background" cssVar="--background" textClass="text-foreground" />
                  <Swatch label="Surface" cssVar="--surface" textClass="text-foreground" />
                  <Swatch label="Surface Elevated" cssVar="--surface-elevated" textClass="text-foreground" />
                  <Swatch label="Border" cssVar="--border" textClass="text-foreground" />
                </div>
              </Section>

              <Section title="טקסט">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Swatch label="Foreground" cssVar="--foreground" />
                  <Swatch label="Foreground Muted" cssVar="--foreground-muted" />
                  <Swatch label="Foreground Subtle" cssVar="--foreground-subtle" />
                </div>
              </Section>
            </div>
          )}

          {/* ── Typography ────────────────────────────────────────────── */}
          {activeTab === "typography" && (
            <div className="flex flex-col gap-8 pt-6">
              <Section title="סולם גדלי גופן">
                <div className="flex flex-col gap-4 bg-surface p-5 rounded-2xl">
                  <p className="text-2xl font-bold text-foreground">
                    32px — כותרת ראשית (text-2xl)
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    24px — כותרת משנית (text-xl)
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    20px — כותרת קטנה (text-lg)
                  </p>
                  <p className="text-base text-foreground">
                    16px — טקסט גוף, קלט (text-base)
                  </p>
                  <p className="text-sm text-foreground-muted">
                    14px — תוית, עזרה (text-sm)
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    12px — מטה-נתונים, תגיות (text-xs)
                  </p>
                </div>
              </Section>

              <Section title="משקל גופן">
                <div className="flex flex-col gap-3 bg-surface p-5 rounded-2xl text-base">
                  <p className="font-normal">font-normal — טקסט רגיל</p>
                  <p className="font-medium">font-medium — טקסט בינוני</p>
                  <p className="font-semibold">font-semibold — טקסט חצי-מודגש</p>
                  <p className="font-bold">font-bold — טקסט מודגש</p>
                </div>
              </Section>

              <Section title="גופן עברי">
                <Card>
                  <p className="text-base leading-relaxed text-foreground">
                    גופן המערכת תומך עברית. המשפחה: Inter (לטיני) +{" "}
                    <span className="font-mono text-sm">Noto Sans Hebrew</span> /{" "}
                    <span className="font-mono text-sm">Arial Hebrew</span> (מקומי).
                    כיווניות RTL נגדרת על ידי{" "}
                    <span className="font-mono text-sm">dir=&quot;rtl&quot;</span> בשורש.
                  </p>
                </Card>
              </Section>
            </div>
          )}

          {/* ── Components ────────────────────────────────────────────── */}
          {activeTab === "components" && (
            <div className="flex flex-col gap-8 pt-6">
              {/* Button */}
              <Section title="כפתורים (Button)">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button variant="primary">ראשי</Button>
                    <Button variant="secondary">משני</Button>
                    <Button variant="ghost">רפאים</Button>
                    <Button variant="danger">סכנה</Button>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button size="sm">קטן</Button>
                    <Button size="md">בינוני</Button>
                    <Button size="lg">גדול</Button>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button loading>טוען...</Button>
                    <Button disabled>מושבת</Button>
                    <Button fullWidth>רוחב מלא</Button>
                  </div>
                </div>
              </Section>

              {/* Input */}
              <Section title="שדה קלט (Input)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="שם המטופל/ת"
                    placeholder="הכנס שם"
                    required
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Input
                    label="שדה עם שגיאה"
                    placeholder="הכנס ערך"
                    error="שדה חובה"
                  />
                  <Input
                    label="שדה עם עזרה"
                    placeholder="DD/MM/YYYY"
                    helperText="פורמט תאריך: יום/חודש/שנה"
                  />
                  <Input
                    label="שדה מושבת"
                    placeholder="לא ניתן לעריכה"
                    disabled
                    value="ערך קיים"
                  />
                </div>
              </Section>

              {/* Textarea */}
              <Section title="אזור טקסט (Textarea)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label="הערות"
                    placeholder="הכנס הערות חופשיות..."
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    helperText="הטקסט מתרחב אוטומטית"
                  />
                  <Textarea
                    label="שדה עם שגיאה"
                    placeholder="הכנס טקסט..."
                    error="אנא מלא שדה זה"
                  />
                </div>
              </Section>

              {/* Badge */}
              <Section title="תגיות (Badge)">
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge variant="default">ברירת מחדל</Badge>
                  <Badge variant="primary">ראשי</Badge>
                  <Badge variant="accent">מבטאים</Badge>
                  <Badge variant="success">הושלם</Badge>
                  <Badge variant="warning">ממתין</Badge>
                  <Badge variant="error">שגיאה</Badge>
                </div>
              </Section>

              {/* Card */}
              <Section title="כרטיס (Card)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card variant="flat">
                    <p className="text-sm text-foreground font-medium">שטוח</p>
                    <p className="text-xs text-foreground-muted mt-1">variant=&quot;flat&quot;</p>
                  </Card>
                  <Card variant="raised">
                    <p className="text-sm text-foreground font-medium">מוגבה</p>
                    <p className="text-xs text-foreground-muted mt-1">variant=&quot;raised&quot; (ברירת מחדל)</p>
                  </Card>
                  <Card variant="outlined">
                    <p className="text-sm text-foreground font-medium">מתאר</p>
                    <p className="text-xs text-foreground-muted mt-1">variant=&quot;outlined&quot;</p>
                  </Card>
                </div>
              </Section>

              {/* Modal */}
              <Section title="חלון דו-שיח (Modal)">
                <div className="flex gap-3">
                  <Button onClick={() => setModalOpen(true)}>פתח מודל</Button>
                </div>
                <Modal
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                  title="כותרת חלון"
                >
                  <p className="text-foreground">
                    זהו תוכן חלון הדו-שיח. הוא נסגר בלחיצה על כפתור הסגירה,
                    בלחיצה על הרקע, או בלחיצה על Escape.
                  </p>
                  <div className="flex gap-3 justify-end mt-2">
                    <Button variant="ghost" onClick={() => setModalOpen(false)}>
                      ביטול
                    </Button>
                    <Button onClick={() => setModalOpen(false)}>אישור</Button>
                  </div>
                </Modal>
              </Section>

              {/* Tabs */}
              <Section title="לשוניות (Tabs)">
                <Tabs
                  tabs={[
                    { id: "tab1", label: "לשונית א" },
                    { id: "tab2", label: "לשונית ב", count: 3 },
                    { id: "tab3", label: "מושבת", disabled: true },
                  ]}
                  activeTab="tab1"
                  onTabChange={() => {}}
                >
                  <p className="pt-4 text-foreground">תוכן לשונית א</p>
                </Tabs>
              </Section>
            </div>
          )}
        </Tabs>
      </div>
    </main>
  );
}
