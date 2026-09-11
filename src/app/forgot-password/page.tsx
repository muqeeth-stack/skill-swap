"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestPasswordReset, resetPassword, validateEmail, validatePassword } from "@/lib/accounts";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"request" | "reset" | "done">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [devCode, setDevCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    const res = requestPasswordReset(email);
    if (!res.ok) {
      setError(res.error || "Unable to start password reset.");
      return;
    }
    setDevCode(res.code || "");
    setInfo("A 6-digit reset code has been generated.");
    setStage("reset");
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Enter the 6-digit reset code.");
      return;
    }
    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.ok) {
      setError(pwCheck.reason || "Password is invalid.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await resetPassword(email, code, newPassword);
      if (!res.ok) {
        setError(res.error || "Password reset failed.");
        setIsSubmitting(false);
        return;
      }
      setStage("done");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white placeholder:text-gray-400";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4 pb-28 sm:pb-10">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-700 p-7 sm:p-9 max-w-md w-full space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl shadow-md">
            🔑
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {stage === "request" && "Reset your password"}
            {stage === "reset" && "Create a new password"}
            {stage === "done" && "Password updated"}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stage === "request" && "Enter the email tied to your SynapseLearn account and we'll verify it."}
            {stage === "reset" && "Enter the 6-digit code and choose a new password."}
            {stage === "done" && "You can now sign in with your new password."}
          </p>
        </div>

        {stage === "request" && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label htmlFor="fp-email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                data-testid="fp-email"
                className={inputCls}
              />
            </div>
            {error && (
              <p role="alert" className="text-[12px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              data-testid="fp-submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              Send Reset Code
            </button>
          </form>
        )}

        {stage === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-1">
              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-bold">
                {error ? "Correction needed:" : info}
              </p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400/80">
                Since this demo build has no email service, your reset code is:{" "}
                <span className="font-mono text-[13px] font-bold" data-testid="fp-code">
                  {devCode}
                </span>
              </p>
            </div>

            <div>
              <label htmlFor="fp-code-input" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                6-Digit Reset Code
              </label>
              <input
                id="fp-code-input"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                data-testid="fp-code-input"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="fp-password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="fp-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters with letters"
                  data-testid="fp-password"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-indigo-600 cursor-pointer"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="fp-confirm" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="fp-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                data-testid="fp-confirm"
                className={inputCls}
              />
            </div>

            {error && (
              <p role="alert" className="text-[12px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="fp-reset"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-2xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Updating…
                </>
              ) : (
                "Reset Password"
              )}
            </button>
            <button
              type="button"
              onClick={() => setStage("request")}
              className="w-full py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 cursor-pointer"
            >
              ← Use a different email
            </button>
          </form>
        )}

        {stage === "done" && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Your password has been updated.
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                Sign in to SynapseLearn with your new password.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              data-testid="fp-done"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              Go to Sign In ➔
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Remembered it?{" "}
          <Link href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Back to Sign In
          </Link>
        </p>

        <div className="text-center text-[10px] text-gray-400 dark:text-gray-500">
          <Link href="/terms" className="hover:underline">Terms</Link>
          <span> · </span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </div>
      </div>
    </div>
  );
}