/**
 * OnboardingModal — Privacy disclaimer shown on first visit.
 *
 * Behaviour:
 *   - Checks localStorage for `prism:onboarding_complete` on mount.
 *   - If the flag is absent, displays the modal.
 *   - "הבנתי, המשך" button sets the flag and closes the modal.
 *   - Modal cannot be dismissed by backdrop click or Escape (disableBackdropClose
 *     + no Escape handler) so the user must actively acknowledge.
 *
 * RTL layout is inherited from the root <html dir="rtl">.
 */

"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ONBOARDING_KEY = "prism:onboarding_complete";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Read the onboarding flag from localStorage.
 * Returns true when the modal should be open (flag not set).
 * Safe to call during client-side render — falls back to false (hidden)
 * when localStorage is unavailable (SSR, private mode, etc.).
 */
function shouldShowOnboarding(): boolean {
  try {
    return !localStorage.getItem(ONBOARDING_KEY);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OnboardingModal() {
  // Lazy initializer runs once on the client.  On the server `localStorage`
  // is undefined so the try/catch in shouldShowOnboarding returns false,
  // keeping the modal closed during SSR and avoiding a hydration mismatch.
  const [open, setOpen] = useState<boolean>(() => shouldShowOnboarding());

  function handleDismiss() {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      // Ignore write failures.
    }
    setOpen(false);
  }

  return (
    <Modal
      open={open}
      onClose={handleDismiss}
      title="פרטיות ואבטחה"
      disableBackdropClose
    >
      <p className="text-base leading-relaxed text-foreground">
        Prism שומר את הנתונים שלך בצורה מאובטחת לענן. הנתונים מוצפנים בזמן
        העברה ובמנוחה.
      </p>

      <Button fullWidth onClick={handleDismiss}>
        הבנתי, המשך
      </Button>
    </Modal>
  );
}

export default OnboardingModal;
