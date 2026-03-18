/**
 * Input — single-line text input for the Prism design system.
 *
 * Font size is always ≥ 16 px (1rem) to prevent iPad Safari auto-zoom.
 * Supports optional label, helper text, and error state.
 * RTL-aware — inherits dir="rtl" from root <html>.
 */

import React, { forwardRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rendered as a visually-associated <label>. */
  label?: string;
  /** Marks the field as required — adds a red asterisk to the label. */
  required?: boolean;
  /** Displayed below the input in red when present. Sets aria-invalid. */
  error?: string;
  /** Displayed below the input in muted colour when no error. */
  helperText?: string;
  /** Wrapper class for the outermost div. */
  wrapperClassName?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    required,
    error,
    helperText,
    id,
    wrapperClassName = "",
    className = "",
    ...rest
  },
  ref
) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText && !error ? `${inputId}-helper` : undefined;

  return (
    <div className={["flex flex-col gap-1", wrapperClassName].join(" ")}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-error ms-0.5">
              {" "}
              *
            </span>
          )}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={errorId ?? helperId}
        className={[
          "w-full rounded-xl border px-4 py-3",
          // Font ≥ 16 px prevents iPad Safari auto-zoom
          "text-base leading-snug",
          "bg-background text-foreground",
          "placeholder:text-foreground-subtle",
          "transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          // State: default / error
          error
            ? "border-error bg-error-light focus-visible:ring-error"
            : "border-border hover:border-border-strong focus-visible:ring-primary",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />

      {error && (
        <p id={errorId} role="alert" className="text-sm text-error">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="text-sm text-foreground-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
