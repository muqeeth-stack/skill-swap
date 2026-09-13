"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { ToastContainer } from "@/components/ui/Toast";

const PROTECTED_PATHS = [
  "/dashboard",
  "/matches",
  "/messages",
  "/connections",
  "/settings",
  "/profile",
  "/paths",
  "/groups",
  "/exchange",
  "/videos",
  "/skill-graph",
  "/recordings",
  "/booksync",
  "/sessions",
  "/calendar",
  "/admin",
];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { theme, authProvider, isAuthChecking, authResolved, currentUser, resyncGoogleSession } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [sessionTimedOut, setSessionTimedOut] = useState(false);

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const sessionPending = isAuthChecking || (isProtected && !authResolved);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Safety net: if the Google session check never resolves, don't leave the user staring at a
  // spinner forever — surface an error card with a manual "Try again" (re-runs the check) instead.
  useEffect(() => {
    if (!sessionPending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- must clear the timed-out card as soon as the session resolves
      setSessionTimedOut(false);
      return;
    }
    const t = setTimeout(() => setSessionTimedOut(true), 12000);
    return () => clearTimeout(t);
  }, [sessionPending, resyncGoogleSession]);

  // Protect private routes: a signed-out user on a protected page goes to /login and returns via ?next=.
  // authResolved gates this so the check runs before we bounce anyone (covers the OAuth return hop where
  // the Google session cookie is restored via /api/auth/me before the page is deemed protected).
  useEffect(() => {
    if (isAuthChecking || !authResolved) return;
    if (isProtected && !currentUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [authProvider, isAuthChecking, authResolved, currentUser, isProtected, pathname, router]);

  if (sessionPending) {
    if (sessionTimedOut) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-4 px-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-8 max-w-sm w-full text-center space-y-4">
            <div className="w-11 h-11 mx-auto rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
              ⚠️
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              We couldn&apos;t restore your session.
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This can happen when Google sign-in finishes in a tab that lost focus. Try again, or
              sign back in.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setSessionTimedOut(false);
                  resyncGoogleSession();
                }}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 transition-colors"
              >
                Try again
              </button>
              <a
                href="/login"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back to sign in
              </a>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold animate-pulse">
          ⚡
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Restoring your session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors pb-16 lg:pb-0 overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
        {children}
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <LayoutContent>{children}</LayoutContent>
    </AppProvider>
  );
}