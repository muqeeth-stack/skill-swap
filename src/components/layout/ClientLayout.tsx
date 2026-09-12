"use client";

import React, { useEffect } from "react";
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
  const { theme, authProvider, isAuthChecking, authResolved, currentUser } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Protect private routes: a signed-out user on a protected page goes to /login and returns via ?next=.
  // authResolved gates this so the check runs before we bounce anyone (covers the OAuth return hop where
  // the Google session cookie is restored via /api/auth/me before the page is deemed protected).
  useEffect(() => {
    if (isAuthChecking || !authResolved) return;
    if (isProtected && !currentUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [authProvider, isAuthChecking, authResolved, currentUser, isProtected, pathname, router]);

  if (isAuthChecking || (isProtected && !authResolved)) {
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