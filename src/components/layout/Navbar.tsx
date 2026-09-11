"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const AiAssistantModal = dynamic(() => import("@/components/ai/AiAssistantModal").then((m) => m.default), { ssr: false });
const GlobalSearchModal = dynamic(() => import("@/components/search/GlobalSearchModal").then((m) => m.GlobalSearchModal), { ssr: false });

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, allUsers, quickLogin, logout, theme, toggleTheme } = useApp();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [switchUserDropdownOpen, setSwitchUserDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/matches", label: "AI Matches", highlight: true },
    { href: "/skills", label: "Skills & Sports" },
    { href: "/exchange", label: "Skill Barter" },
    { href: "/videos", label: "Masterclasses" },
    { href: "/paths", label: "Learning Paths" },
    { href: "/groups", label: "Learning Rooms" },
    { href: "/connections", label: "Network" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href !== "/dashboard" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 shrink-0">
            <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  SYNAPSE<span className="text-indigo-600 dark:text-indigo-400">LEARN</span>
                </span>
                <span className="text-[10px] font-medium tracking-wide text-gray-600 dark:text-gray-400 -mt-1 hidden sm:block">
                  Learn. Share. Connect.
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    active
                      ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 font-semibold shadow-2xs"
                      : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  } ${link.highlight && !active ? "text-indigo-600 dark:text-indigo-400" : ""}`}
                >
                  {link.label}
                  {link.highlight && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-bold uppercase bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 rounded-full">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={() => setSearchOpen(true)}
              data-testid="global-search-btn"
              title="Search"
              aria-label="Search SynapseLearn"
              className="px-2.5 sm:px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700/70 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <span>🔍</span>
              <span className="hidden sm:inline">{pathname === "/matches" ? "Search matches" : "Search"}</span>
            </button>

            <button
              onClick={() => setAiModalOpen(true)}
              data-testid="ai-assistant-btn"
              title="AI Assistant"
              aria-label="AI Assistant"
              className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <span className="text-amber-500 animate-pulse">✨</span>
              <span className="hidden sm:inline">AI Assistant</span>
            </button>

            {currentUser ? (
              <>
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300">
                  <span>🪙</span>
                  <span>{currentUser.credits || 120} pts</span>
                </div>

                <NotificationBell />

                <button
                  onClick={toggleTheme}
                  data-testid="theme-toggle"
                  title="Toggle Theme"
                  aria-label="Toggle theme"
                  className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  {theme === "dark" ? "☀️" : "🌙"}
                </button>

                {/* Persona Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setSwitchUserDropdownOpen(!switchUserDropdownOpen)}
                    className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer"
                  >
                    <span>Switch Role</span>
                    <span className="text-[9px]">▼</span>
                  </button>

                  {switchUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400">Switch Demo Persona</div>
                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            quickLogin(u.email);
                            setSwitchUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer ${
                            u.id === currentUser.id ? "bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-600" : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <Image
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`}
                            alt={u.name}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="truncate">
                            <div className="truncate">{u.name}</div>
                            <div className="text-[10px] text-gray-600 truncate">{u.skillsTeach[0]?.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Avatar Menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    aria-label="Open account menu"
                    aria-expanded={profileDropdownOpen}
                    className="flex items-center gap-2 p-1 rounded-xl hover:ring-2 hover:ring-indigo-500/30 transition-all cursor-pointer"
                  >
                    <Image
                      src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`}
                      alt={currentUser.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                    />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{currentUser.name}</p>
                        <p className="text-[11px] text-gray-600 truncate">{currentUser.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                      >
                        👤 View Profile & Badges
                      </Link>
                      <Link
                        href="/messages"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                      >
                        💬 Messages & Sessions
                      </Link>
                      <Link
                        href="/videos"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                      >
                        🎥 Video Masterclasses
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        ⚙️ Account Settings
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 font-semibold"
                      >
                        🛡️ Admin & Moderation Panel
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <AiAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
