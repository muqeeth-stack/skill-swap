"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { SKILL_CATEGORIES_METADATA } from "@/types";
import { MatchCard } from "@/components/matching/MatchCard";

export default function HomePage() {
  const router = useRouter();
  const { currentUser, getMatches } = useApp();
  const [nlQuery, setNlQuery] = useState("");

  const sampleMatches = currentUser ? getMatches().slice(0, 3) : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    router.push(`/matches?q=${encodeURIComponent(nlQuery.trim())}`);
  };

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 sm:p-14 lg:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI-POWERED SKILL EXCHANGE & PEER LEARNING</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Learn. Share. Connect. <br />
            <span className="bg-gradient-to-r from-teal-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Powered by Intelligent Synergy.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed font-normal">
            SynapseLearn connects learners and mentors worldwide through transparent AI matching. Barter skills in Tech, Cricket & Sports, Design, Languages, and Arts — completely peer-driven with zero barriers.
          </p>

          {/* Natural Language AI Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1.5 shadow-2xl focus-within:ring-2 focus-within:ring-teal-400 transition-all">
              <span className="pl-3.5 pr-2 text-indigo-200 text-lg">✨</span>
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="e.g. I want to learn Cricket fast bowling and can teach Python or Next.js..."
                className="w-full bg-transparent px-2 py-2.5 text-sm text-white placeholder-indigo-200/60 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-gray-950 font-bold text-xs rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                Match with AI ➔
              </button>
            </div>
          </form>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-white text-indigo-900 font-bold text-sm rounded-xl shadow-lg hover:bg-indigo-50 hover:shadow-xl transition-all"
            >
              Start Free Onboarding ➔
            </Link>
            <Link
              href="/skills"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm rounded-xl backdrop-blur-md transition-all"
            >
              Explore 8 Skill Domains 🏏 💻
            </Link>
          </div>
        </div>
      </section>

      {/* Domain Spotlight */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              <span>Standardized Taxonomy & Sports Mode</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Multi-Domain Skill Catalog with Sports Mode
            </h2>
          </div>
          <Link href="/skills" className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            View All Domains ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SKILL_CATEGORIES_METADATA.map((cat) => (
            <Link
              key={cat.id}
              href={`/skills?category=${cat.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-2">{cat.id === "sports" ? "🏏" : cat.id === "technology" ? "💻" : cat.id === "creative" ? "🎨" : cat.id === "languages" ? "🗣️" : "📚"}</div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Live AI Matching Preview */}
      {sampleMatches.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Live AI Matches for You
            </h2>
            <Link href="/matches" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs">
              View All Matches ➔
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleMatches.map((score) => (
              <MatchCard key={score.targetUser.id} user={score.targetUser} score={score} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
