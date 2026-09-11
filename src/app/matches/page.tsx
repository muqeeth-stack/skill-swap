"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { MatchCard } from "@/components/matching/MatchCard";
import { MatchFilterModal } from "@/components/matching/MatchFilterModal";
import { ChatDrawer } from "@/components/chat/ChatDrawer";

function MatchesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { currentUser, getMatches, searchWithAI } = useApp();
  const [nlQuery, setNlQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("all");
  const [minScore, setMinScore] = useState(30);
  const [matchTypeFilter, setMatchTypeFilter] = useState("all");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Sync nlQuery when URL param changes (adjust state during render)
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  if (prevInitialQuery !== initialQuery) {
    setPrevInitialQuery(initialQuery);
    setNlQuery(initialQuery);
  }

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Please sign in to view your matches</h2>
      </div>
    );
  }

  let matches = nlQuery.trim() ? searchWithAI(nlQuery).matches : getMatches();

  // Filter by min score with fallback
  const scoreFiltered = matches.filter((m) => m.overallScore >= minScore);
  matches = scoreFiltered.length > 0 ? scoreFiltered : matches.slice(0, 8);

  // Filter by match type
  if (matchTypeFilter !== "all") {
    matches = matches.filter((m) => m.matchType === matchTypeFilter);
  }

  // Filter by category
  if (activeCategory !== "all") {
    matches = matches.filter((m) =>
      m.targetUser.skillsTeach.some((s) => s.category.toLowerCase() === activeCategory.toLowerCase()) ||
      m.targetUser.skillsLearn.some((s) => s.category.toLowerCase() === activeCategory.toLowerCase())
    );
  }

  const handleOpenChat = (userId: string) => {
    setChatUserId(userId);
    setIsChatOpen(true);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <span>Intelligent Synergy Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            AI Compatibility & Match Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time multi-dimensional scoring based on reciprocal skills, learning styles, pace, and schedule overlap.
          </p>
        </div>

        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-indigo-50 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>⚙️ Tune Algorithm Weights</span>
        </button>
      </div>

      {/* Natural Language Query Bar */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-3">
        <div className="relative flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
          <span className="pl-3 pr-2 text-indigo-600 text-base">✨</span>
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            placeholder="Search with natural language, e.g. 'I want to learn Cricket fast bowling and can teach Next.js'..."
            aria-label="Search matches with natural language"
            className="w-full bg-transparent px-2 py-2 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden"
          />
          {nlQuery && (
            <button
              onClick={() => setNlQuery("")}
              className="px-2 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Disciplines" },
              { id: "sports", label: "🏏 Sports & Athletics" },
              { id: "technology", label: "💻 Tech & Dev" },
              { id: "creative", label: "🎨 Creative & UI" },
              { id: "languages", label: "🗣️ Languages" },
              { id: "academics", label: "📚 Academics" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white font-bold shadow-xs"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={matchTypeFilter}
              onChange={(e) => setMatchTypeFilter(e.target.value)}
              aria-label="Match type filter"
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium dark:text-white"
            >
              <option value="all">All Match Types</option>
              <option value="1on1_exchange">⚡ Mutual 2-Way Exchange</option>
              <option value="mentor_match">🎓 Mentor Matches</option>
              <option value="peer_partner">🤝 Peer Practice</option>
            </select>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-[11px] font-medium">Min:</span>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                aria-label="Minimum match score"
                className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400"
              >
                <option value={40}>40%+</option>
                <option value={50}>50%+</option>
                <option value={60}>60%+</option>
                <option value={70}>70%+</option>
                <option value={80}>80%+</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      {matches.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No matches found for this filter</h3>
          <button
            onClick={() => {
              setNlQuery("");
              setActiveCategory("all");
              setMinScore(40);
              setMatchTypeFilter("all");
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((score) => (
            <MatchCard
              key={score.targetUser.id}
              user={score.targetUser}
              score={score}
              onOpenChat={handleOpenChat}
            />
          ))}
        </div>
      )}

      <MatchFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />
      <ChatDrawer
        targetUserId={chatUserId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}


export default function MatchesPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading AI matches...</div>}>
      <MatchesContent />
    </React.Suspense>
  );
}
