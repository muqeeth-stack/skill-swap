"use client";

import React, { useEffect } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { ToastContainer } from "@/components/ui/Toast";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

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
