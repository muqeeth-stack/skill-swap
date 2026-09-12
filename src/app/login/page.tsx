"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { validateEmail } from "@/lib/accounts";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
const { login, logout, allUsers, quickLogin, loginWithGoogle, isGoogleConfigured, isAuthChecking, authProvider, currentUser, showToast } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const next = searchParams.get("next") || "/dashboard";

  // Only auto-redirect on a REAL persisted auth session (email/password or Google).
  // The default demo persona stays on /login so visitors can register or switch accounts.
  useEffect(() => {
    if (isAuthChecking) return;
    if (currentUser && (authProvider === "password" || authProvider === "google")) {
      router.replace(next);
    }
  }, [currentUser, isAuthChecking, authProvider, router, next]);
  // Surface OAuth failure/cancel messages from ?error= (render-derived, toast via effect)
  const oauthError = useMemo(() => {
    const e = searchParams.get("error");
    if (!e) return "";
    if (e === "oauth_cancelled") return "Google sign-in was cancelled.";
    if (e === "state_mismatch") return "Google sign-in failed a security check. Please try again.";
    if (e === "session_expired") return "Your session expired. Please sign in again.";
    return "Google sign-in failed. Please try again or use a password account.";
  }, [searchParams]);

  useEffect(() => {
    if (oauthError) {
      showToast(oauthError, "error");
    }
  }, [oauthError, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    if (!validateEmail(email)) {
      setFieldError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setFieldError("Enter your password.");
      return;
    }
    setIsSubmitting(true);
    try {
      const ok = await login(email, password, rememberMe);
      if (ok) {
        router.push(next);
      } else {
        setFieldError("Sign-in failed. Check your email and password, or create a new account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = () => {
    logout();
    loginWithGoogle(next);
  };

  const handleFastSwitch = (userEmail: string) => {
    quickLogin(userEmail);
    router.push("/dashboard");
  };
const demoPersonas = (() => {
  const order = ["Priya Patel", "Alex Kim", "Aisha Khan", "Marcus Chen", "Sofia García", "Yuki Tanaka"];
  const sorted = [...allUsers].sort((a, b) => {
    const ia = order.indexOf(a.name);
    const ib = order.indexOf(b.name);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return sorted.slice(0, 6);
})();

  const fieldErr = fieldError || oauthError;

  return (
    <div className="min-h-[86vh] flex items-center justify-center py-6 px-4 pb-28 sm:pb-10">
      <div className="w-full max-w-md space-y-5">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome back to <span className="text-indigo-600 dark:text-indigo-400">SynapseLearn</span>
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            Learn. Share. Connect. — sign in to continue your skill exchange journey.
          </p>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          data-testid="google-signin-btn"
          disabled={isAuthChecking}
          title={isGoogleConfigured ? "Continue with Google" : "Google sign-in requires Google OAuth to be configured"}
          className="w-full py-3 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-60 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-2.5 shadow-xs cursor-pointer transition-all"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>
        {!isGoogleConfigured && !isAuthChecking && (
          <p className="text-center text-[11px] text-amber-600 dark:text-amber-400 -mt-1">
            Google sign-in activates once <code className="font-mono">AUTH_GOOGLE_CLIENT_ID</code> &amp;
            <code className="font-mono"> AUTH_GOOGLE_CLIENT_SECRET</code> are configured. Use a password account to sign in right now.
          </p>
        )}

        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 dark:border-gray-700 w-full" />
          <span className="bg-gray-50 dark:bg-gray-900 px-3 text-[11px] text-gray-400 uppercase font-medium">or sign in with email</span>
        </div>

        {/* Email / Password */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-7 space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError("");
              }}
              placeholder="you@example.com"
              data-testid="login-email"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldError("");
                }}
                placeholder="••••••••"
                data-testid="login-password"
                className="w-full px-3.5 py-2.5 pr-11 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 cursor-pointer rounded-lg"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              data-testid="remember-me"
              className="w-4 h-4 rounded accent-indigo-600"
            />
            Remember me on this device
          </label>

          {fieldErr && (
            <p role="alert" className="text-[12px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 rounded-xl px-3 py-2">
              {fieldErr}
            </p>
          )}

          <button
            type="submit"
            data-testid="login-submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In ➔"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Create a free account
          </Link>
        </p>

        <div className="text-center text-[10px] text-gray-400 dark:text-gray-500 space-x-1">
          <Link href="/terms" className="hover:underline">Terms</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} SynapseLearn</span>
        </div>
        <div className="text-center text-[10px] text-gray-400 dark:text-gray-500">
          {next !== "/dashboard" && `Returning you to ${next} after sign-in.`}
        </div>

        {/* Demo personas — explicitly labeled as fictional demo accounts */}
        <details className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 p-4 text-xs">
          <summary className="text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer text-center">
            🧪 Just exploring? Try a fictional demo persona
          </summary>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {demoPersonas.map((u) => (
              <button
                key={u.id}
                onClick={() => handleFastSwitch(u.email)}
                data-testid={
                  u.name.includes("Priya")
                    ? "persona-priya"
                    : u.name.includes("Alex")
                      ? "persona-alex"
                      : `persona-${u.id}`
                }
                className="p-2 bg-white dark:bg-gray-800 hover:border-indigo-400 border border-gray-200 dark:border-gray-700 rounded-xl text-left flex items-center gap-2 cursor-pointer transition-all"
              >
                <Image
                  src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`}
                  alt={u.name}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <div className="truncate">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{u.name}</div>
                  <div className="text-[10px] text-gray-600 dark:text-gray-300 truncate">{u.skillsTeach[0]?.name}</div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-[9px] text-gray-400 mt-2">
            Demo personas are fictional sample accounts used to explore the product. Real accounts use email/password or Google.
          </p>
        </details>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-sm text-gray-400">Loading sign-in…</div>}>
      <LoginContent />
    </Suspense>
  );
}