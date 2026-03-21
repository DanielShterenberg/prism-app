"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import PrismLogo from "@/components/PrismLogo";

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getClientAuth(), email, password);
      router.replace("/");
    } catch {
      setError("אימייל או סיסמה שגויים");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithPopup(getClientAuth(), googleProvider);
      router.replace("/");
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      setError(e?.code ?? e?.message ?? "הכניסה עם Google נכשלה");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "#09090f" }}
    >
      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-[360px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex justify-center mb-4">
            <PrismLogo size="lg" />
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-sm">
            מערכת הערכה קלינית
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 min-h-[44px] disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.95)",
              color: "#1a1a2e",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? "מתחבר..." : "כניסה עם Google"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ color: "rgba(255,255,255,0.3)", background: "transparent" }}>
                או
              </span>
            </div>
          </div>

          {/* Email/password */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-base outline-none transition-all duration-150"
              placeholder="אימייל"
              dir="ltr"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "white",
              }}
            />
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-base outline-none transition-all duration-150"
              placeholder="סיסמה"
              dir="ltr"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "white",
              }}
            />

            {error && (
              <p className="text-xs rounded-lg px-3 py-2"
                style={{ color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-xl px-4 py-3 text-base font-semibold text-white transition-all duration-150 min-h-[44px] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              {loading ? "מתחבר..." : "כניסה"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
