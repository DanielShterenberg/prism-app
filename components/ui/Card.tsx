/**
 * Card — surface container with optional padding and shadow.
 *
 * Variants: flat | raised | outlined
 * RTL-aware — content flows naturally from root dir="rtl".
 * Touch target notes: Card itself is not interactive; use Button inside if needed.
 */

import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CardVariant = "flat" | "raised" | "outlined";

export interface CardProps {
  variant?: CardVariant;
  /** Extra padding on all sides. Default: true. */
  padded?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Forwarded to the root element. */
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Style map
// ---------------------------------------------------------------------------

const VARIANT_STYLES: Record<CardVariant, string> = {
  flat:     "bg-surface",
  raised:   "bg-surface-elevated shadow-md",
  outlined: "bg-background border border-border",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Card({
  variant = "raised",
  padded = true,
  children,
  className = "",
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={[
        "rounded-2xl",
        VARIANT_STYLES[variant],
        padded ? "p-5" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export default Card;
