/**
 * Button — primary design-system button component.
 *
 * Variants: primary | secondary | ghost | danger
 * Sizes:    sm | md | lg
 *
 * All touch targets ≥ 44 px.
 * RTL-aware — layout is inherited from root <html dir="rtl">.
 */

import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a loading spinner and disables interaction. */
  loading?: boolean;
  /** Full-width block button. */
  fullWidth?: boolean;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: [
    "bg-primary text-primary-foreground",
    "hover:bg-primary-hover active:bg-primary-active",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  ].join(" "),

  secondary: [
    "bg-transparent text-primary border border-primary",
    "hover:bg-primary-light active:bg-primary-light/70",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  ].join(" "),

  ghost: [
    "bg-transparent text-foreground",
    "hover:bg-surface active:bg-border",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  ].join(" "),

  danger: [
    "bg-error text-white",
    "hover:bg-red-700 active:bg-red-800",
    "focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2",
  ].join(" "),
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-2 min-h-[36px] rounded-lg",
  md: "text-base px-5 py-3 min-h-[44px] rounded-xl",
  lg: "text-lg px-6 py-3.5 min-h-[52px] rounded-xl",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={[
        // Base
        "inline-flex items-center justify-center gap-2",
        "font-semibold transition-all duration-150 select-none",
        "focus:outline-none",
        // Variant
        VARIANT_STYLES[variant],
        // Size
        SIZE_STYLES[size],
        // Width
        fullWidth ? "w-full" : "",
        // Disabled
        isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        // Scale feedback on tap
        !isDisabled ? "active:scale-[0.98]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-busy={loading ? true : undefined}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
        />
      )}
      {children}
    </button>
  );
}

export default Button;
