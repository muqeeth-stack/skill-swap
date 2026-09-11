"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Home", icon: "🏠" },
    { href: "/matches", label: "Matches", icon: "⚡" },
    { href: "/skills", label: "Skills", icon: "🏸" },
    { href: "/exchange", label: "Barter", icon: "⇄" },
    { href: "/messages", label: "Chat", icon: "💬" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
              active
                ? "text-indigo-600 dark:text-indigo-400 font-bold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            <span className="text-[10px] mt-0.5">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
