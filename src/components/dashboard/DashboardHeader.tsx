"use client";

import React from "react";
import Image from "next/image";
import { User } from "@/types";
import { useApp } from "@/context/AppContext";

interface DashboardHeaderProps {
  currentUser: User;
  onOpenProfileImprove: () => void;
  onOpenAiAssistant: () => void;
}

export function DashboardHeader({ currentUser, onOpenProfileImprove, onOpenAiAssistant }: DashboardHeaderProps) {
  const { isHydrated } = useApp();
  // Time-of-day greeting must not appear during SSR/hydration first paint,
  // otherwise server (UTC) and client (local TZ) text differs → React error #418.
  const greeting = !isHydrated
    ? "Hello"
    : (() => {
        const hour = new Date().getHours();
        return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
      })();

  // Calculate profile completeness
  let score = 50;
  const missingItems: string[] = [];
  if (currentUser.bio && currentUser.bio.length > 30) score += 15;
  else missingItems.push("Add detailed bio");

  if (currentUser.skillsTeach && currentUser.skillsTeach.length >= 2) score += 15;
  else missingItems.push("Add 1 more skill you teach");

  if (currentUser.skillsLearn && currentUser.skillsLearn.length >= 2) score += 10;
  else missingItems.push("Add 1 more learning goal");

  if (currentUser.availableDays && currentUser.availableDays.length > 0) score += 10;
  else missingItems.push("Set weekly schedule");

  const completeness = Math.min(score, 100);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* User Identity & Greeting */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            <Image
              src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`}
              alt={currentUser.name}
              width={64}
              height={64}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/15 shadow-lg"
            />
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-indigo-950 flex items-center justify-center text-[10px] text-white font-bold"
              title="Verified Active Learner"
            >
              ✓
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {greeting}, {currentUser.name}! 👋
              </h1>
              {currentUser.isLinkedInVerified && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full">
                  Verified Mentor
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl leading-relaxed">
              {currentUser.bio || "Ready to exchange skills, mentor peers, and advance your goals today?"}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onOpenProfileImprove}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>✨ Improve Profile with AI</span>
                <span>➔</span>
              </button>
              <button
                onClick={onOpenAiAssistant}
                className="text-[11px] font-bold text-indigo-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>🧠 Ask AI Assistant</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics & Quick Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[95px]">
            <div className="text-lg font-black text-amber-300">🔥 {currentUser.streakDays || 12} Days</div>
            <div className="text-[10px] text-indigo-200 font-semibold">Learning Streak</div>
          </div>
          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[95px]">
            <div className="text-lg font-black text-teal-300">🪙 {currentUser.credits || 120}</div>
            <div className="text-[10px] text-indigo-200 font-semibold">Synapse Barter Credits</div>
          </div>
          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[95px]">
            <div className="text-lg font-black text-emerald-300">⭐ {currentUser.rating ? currentUser.rating.toFixed(1) : "5.0"}</div>
            <div className="text-[10px] text-indigo-200 font-semibold">{currentUser.totalReviews || 18} Reviews</div>
          </div>
        </div>
      </div>

      {/* Profile Completion Strip */}
      <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">Profile Strength:</span>
              <span className="text-amber-300 font-bold">{completeness}% Complete</span>
              {missingItems.length > 0 && (
                <span className="text-indigo-200 text-[11px] hidden md:inline">
                  • Missing: {missingItems.slice(0, 2).join(", ")}
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        <button
          onClick={onOpenProfileImprove}
          className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
        >
          <span>Complete Profile</span>
          <span className="text-amber-300">✨</span>
        </button>
      </div>
    </div>
  );
}
