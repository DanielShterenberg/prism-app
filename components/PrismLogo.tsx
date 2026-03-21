/**
 * PrismLogo — the Prism brand mark: triangular prism icon + wordmark.
 * Generated from Stitch brand identity screen (project 444836185388752986).
 *
 * Usage:
 *   <PrismLogo />           — default (icon + wordmark, size "md")
 *   <PrismLogo size="lg" /> — larger variant for login/splash
 *   <PrismLogo iconOnly />  — icon only, no wordmark
 */

interface PrismLogoProps {
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
}

const sizes = {
  sm: { icon: 22, text: "text-[15px]", gap: "gap-2" },
  md: { icon: 28, text: "text-[17px]", gap: "gap-2.5" },
  lg: { icon: 44, text: "text-[28px]", gap: "gap-3.5" },
};

export default function PrismLogo({ size = "md", iconOnly = false }: PrismLogoProps) {
  const { icon, text, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Triangular prism icon — CSS clip-path approach from Stitch */}
      <div
        style={{
          width: icon,
          height: icon,
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          background: "linear-gradient(135deg, #7c3aed 0%, #3626ce 100%)",
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      {!iconOnly && (
        <span
          className={`text-white font-semibold tracking-tight ${text}`}
          style={{ fontFamily: "Rubik, sans-serif" }}
        >
          Prism
        </span>
      )}
    </div>
  );
}
