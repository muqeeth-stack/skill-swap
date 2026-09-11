"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, allUsers, quickLogin, loginWithGoogle, isGoogleConfigured, isAuthChecking, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError) {
      const message =
        authError === "oauth_cancelled"
          ? "Google sign-in was cancelled."
          : authError === "state_mismatch"
            ? "Google sign-in failed a security check. Please try again."
            : "Google sign-in failed. Please try again or use a demo persona.";
      showToast(message, "error");
    }
  }, [searchParams, showToast]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim()) {
      setErrorMsg("Enter your email, or use a demo persona below.");
      return;
    }
    const ok = login(email.trim());
    if (ok) {
      router.push("/dashboard");
    } else {
      setErrorMsg("No account found with that email. Use Google Sign-In or register below.");
    }
  };

  const handleFastSwitch = (userEmail: string) => {
    quickLogin(userEmail);
    router.push("/dashboard");
  };

  const handleGoogle = () => {
    loginWithGoogle();
  };

  const demoPersonas = [
    ...allUsers.filter((u) => u.name.includes("Priya")),
    ...allUsers.filter((u) => !u.name.includes("Priya")),
  ].slice(0, 6);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-700 p-8 sm:p-10 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-md">
            ⚡
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Sign In to SynapseLearn</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Continue exchanging skills and learning from peers.</p>
        </div>

        {/* Real Google Authentication */}
        <button
          type="button"
          onClick={handleGoogle}
          data-testid="google-signin-btn"
          disabled={isAuthChecking}
          title={isGoogleConfigured ? "Continue with Google" : "Google is not configured yet"}
          className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-60 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>
        {!isGoogleConfigured && !isAuthChecking && (
          <p className="text-center text-[11px] text-amber-600 dark:text-amber-400 -mt-3">
            Set <code className="font-mono">AUTH_GOOGLE_CLIENT_ID</code> &amp;{" "}
            <code className="font-mono">AUTH_GOOGLE_CLIENT_SECRET</code> to enable real Google authentication.
          </p>
        )}

        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 dark:border-gray-700 w-full" />
          <span className="bg-white dark:bg-gray-800 px-3 text-[11px] text-gray-400 uppercase font-medium">Or</span>
        </div>

        {/* Fast Persona Login */}
        <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
            ⚡ 1-Click Demo Persona Sign-In:
          </div>
          <div className="grid grid-cols-2 gap-2">
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
                  <div className="text-[10px] text-gray-600 truncate">{u.skillsTeach[0]?.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Local Account Email
              <span className="ml-1 font-normal text-gray-400">(for registered users)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden dark:text-white"
            />
          </div>

          {errorMsg && <p className="text-[11px] text-red-500">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Sign In ➔
          </button>
          <p className="text-center text-[10px] text-gray-600 leading-relaxed">
            Local accounts are stored on this device for demo purposes. Use{" "}
            <span className="text-gray-500">Continue with Google</span> for real authentication.
          </p>
        </form>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Register with Wizard
          </Link>
        </div>
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