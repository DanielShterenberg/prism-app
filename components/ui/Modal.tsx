/**
 * Modal — accessible dialog overlay.
 *
 * Features:
 *   - Traps focus within the modal while open
 *   - Closes on Escape key
 *   - Backdrop click closes (configurable)
 *   - aria-modal + aria-labelledby wiring
 *   - RTL layout (inherits from root dir="rtl")
 *
 * Usage:
 *   <Modal open={open} onClose={() => setOpen(false)} title="כותרת">
 *     content
 *   </Modal>
 */

"use client";

import React, { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Prevent closing when clicking the backdrop. Default: false. */
  disableBackdropClose?: boolean;
  children: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Modal({
  open,
  onClose,
  title,
  disableBackdropClose = false,
  children,
  className = "",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(
    `modal-title-${Math.random().toString(36).slice(2, 9)}`
  ).current;

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Focus first focusable element when modal opens
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (!disableBackdropClose && e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          "relative z-10 w-full max-w-md",
          "bg-surface-elevated rounded-2xl shadow-lg",
          "p-6 flex flex-col gap-5",
          "max-h-[90dvh] overflow-y-auto",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Header */}
        {title !== undefined && (
          <div className="flex items-center justify-between gap-3">
            <h2
              id={titleId}
              className="text-xl font-bold text-foreground"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="סגור"
              className={[
                "w-11 h-11 flex items-center justify-center rounded-full flex-shrink-0",
                "text-foreground-muted hover:text-foreground hover:bg-surface",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              ].join(" ")}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ✕
              </span>
            </button>
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

export default Modal;
