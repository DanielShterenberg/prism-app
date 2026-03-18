/**
 * Textarea — auto-expanding multi-line text input.
 *
 * Height grows with content — never shows a scroll bar (PRD constraint).
 * Font size ≥ 16 px to prevent iPad Safari auto-zoom.
 * RTL-aware, supports label / error / helperText same as Input.
 */

"use client";

import React, { forwardRef, useCallback, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

// ---------------------------------------------------------------------------
// Auto-expand helper
// ---------------------------------------------------------------------------

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      required,
      error,
      helperText,
      id,
      wrapperClassName = "",
      className = "",
      onChange,
      onFocus,
      ...rest
    },
    forwardedRef
  ) {
    const inputId = id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;

    // Internal ref for auto-resize (merged with forwardedRef if provided)
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLTextAreaElement>) ?? internalRef;

    // Resize on mount when there is an initial value
    useEffect(() => {
      if (ref.current) autoResize(ref.current);
    }, [ref]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        autoResize(e.target);
        onChange?.(e);
      },
      [onChange]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        autoResize(e.target);
        onFocus?.(e);
      },
      [onFocus]
    );

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

        <textarea
          ref={ref}
          id={inputId}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={errorId ?? helperId}
          rows={2}
          onChange={handleChange}
          onFocus={handleFocus}
          className={[
            "w-full rounded-xl border px-4 py-3",
            // Font ≥ 16 px prevents iPad Safari auto-zoom
            "text-base leading-relaxed",
            "bg-background text-foreground",
            "placeholder:text-foreground-subtle",
            // Auto-expand — no scroll bars
            "resize-none overflow-hidden",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
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
  }
);

export default Textarea;
