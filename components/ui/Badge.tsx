/**
 * Badge — small inline label chip.
 *
 * Variants: default | primary | accent | success | warning | error
 * Used for status labels, tags, and counts.
 * RTL-aware — text direction inherited from root.
 */

import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BadgeVariant =
  | "default"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "error";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Style map
// ---------------------------------------------------------------------------

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default:  "bg-surface text-foreground border border-border",
  primary:  "bg-primary-light text-primary",
  accent:   "bg-accent-light text-accent",
  success:  "bg-success-light text-success-foreground",
  warning:  "bg-warning-light text-warning-foreground",
  error:    "bg-error-light text-error-foreground",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        "text-xs font-medium px-2.5 py-0.5 rounded-full",
        "select-none whitespace-nowrap",
        VARIANT_STYLES[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

export default Badge;
