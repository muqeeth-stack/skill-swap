"use client";

import React from "react";
import Link from "next/link";
import { RegistrationWizard } from "@/components/auth/RegistrationWizard";
import { useApp } from "@/context/AppContext";

export default function RegisterPage() {
  const { loginWithGoogle, isGoogleConfigured, showToast } = useApp();
  const handleGoogle = () => {
    if (!isGoogleConfigured) {
      showToast(
        "Google sign-up is not configured yet. Set AUTH_GOOGLE_CLIENT_ID & AUTH_GOOGLE_CLIENT_SECRET, or create an email account below.",
        "warning"
      );
      return;
    }
    loginWithGoogle();
  };

  return (
    <div className="py-6 pb-28 sm:pb-10">
      <div className="max-w-2xl mx-auto mb-6 text-center space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Join <span className="text-indigo-600 dark:text-indigo-400">SynapseLearn</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create a free account, build your profile, and start exchanging skills with vetted peers.
        </p>
        <button
          type="button"
          onClick={handleGoogle}
          data-testid="reg-google"
          className="mt-2 px-5 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-2 shadow-xs mx-auto cursor-pointer transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Sign up with Google
        </button>
        <div className="relative flex items-center justify-center max-w-sm mx-auto mt-4">
          <div className="border-t border-gray-200 dark:border-gray-700 w-full" />
          <span className="bg-gray-50 dark:bg-gray-900 px-3 text-[11px] text-gray-400 uppercase font-medium">
            or with email &amp; password
          </span>
        </div>
        <p className="text-[11px] text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <RegistrationWizard />
    </div>
  );
}